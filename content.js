(function () {
  console.log("Content script loaded on:", window.location.href);

  function detectNumbers() {
    const regex = /(?:\+?\d[\d\s-]{7,14}\d)/g;
    const numbers = new Set();

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);

    while (walker.nextNode()) {
      const text = walker.currentNode.nodeValue;
      const match = text.match(regex);
      if (match) {
        match.forEach(num => numbers.add(num.replace(/\s|-/g, "")));
      }
    }

    chrome.runtime.sendMessage({
      action: "numbers_detected",
      payload: Array.from(numbers)
    }).catch(() => {});
  }

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === "scan_page") {
      detectNumbers();
    }
  });

  // Prevent multiple observers from stacking
  if (!window.__telegramObserverAdded) {
    window.__telegramObserverAdded = true;

    const observer = new MutationObserver(() => detectNumbers());
    observer.observe(document.body, { childList: true, subtree: true });
  }
})();
