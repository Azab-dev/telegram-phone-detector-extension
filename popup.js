document.getElementById("scanBtn").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      func: () => {
        const text = document.body.innerText;
        return [...text.matchAll(/(?:\+?20)?\s?\d{3}\s?\d{3}\s?\d{4}|\d{11}/g)]
          .map(m => m[0]);
      },
    },
    (result) => {
      const numbers = result[0].result || [];
      renderNumbers(numbers);
    }
  );
});

function renderNumbers(numbers) {
  const container = document.getElementById("numbersContainer");
  container.innerHTML = "";

  if (numbers.length === 0) {
    container.innerHTML = "<p>No numbers detected.</p>";
    return;
  }

  numbers.forEach(num => {
    const row = document.createElement("div");
    row.className = "number-row";

    row.innerHTML = `
      <span>${num}</span>
      <div class="actions">
        <button class="copyBtn">Copy</button>
        <button class="openBtn">Open</button>
      </div>
    `;

    // Copy button
    row.querySelector(".copyBtn").addEventListener("click", () => {
      navigator.clipboard.writeText(num);
    });

    // Open in Telegram
    row.querySelector(".openBtn").addEventListener("click", () => {
      window.open("https://t.me/" + num, "_blank");
    });

    container.appendChild(row);
  });
}
