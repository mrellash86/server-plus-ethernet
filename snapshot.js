document.addEventListener("DOMContentLoaded", () => {
  const timerDisplayElement = document.getElementById("timer-display");
  let timeLeft = 60;
  let timerInterval;
  let gameActive = true;
  let confettiHasFired = false;

  function updateTimerDisplay() {
    timerDisplayElement.textContent = `Time Left: ${timeLeft}s`;
  }

  function stopGame(isWin = false) {
    console.log(isWin ? "Game Won!" : "Time is up!");
    timerDisplayElement.textContent = isWin ? "You Win!" : "Time's Up!";
    gameActive = false;
    clearInterval(timerInterval);

    document.querySelectorAll(".draggable-item").forEach((item) => {
      if (!item.closest(".filled")) {
        item.style.opacity = "0.6";
        item.style.cursor = "not-allowed";
      }
      item.draggable = false;
    });
    document.querySelectorAll(".drop-zone:not(.filled)").forEach((zone) => {
      zone.style.backgroundColor = "#f0f0f0";
      zone.style.borderColor = "#d0d0d0";
      zone.classList.remove("drag-over");
    });

    if (!isWin) {
      setTimeout(() => {
        alert("Time's up! You can no longer move items.");
      }, 100);
    }
  }

  function countdown() {
    if (!gameActive) return;

    if (timeLeft > 0) {
      timeLeft--;
      updateTimerDisplay();
    }

    if (timeLeft <= 0) {
      if (gameActive) {
        stopGame(false);
      }
    }
  }

  function shuffleAnswers(container) {
    const items = Array.from(container.querySelectorAll(".draggable-item"));
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    items.forEach((item) => container.appendChild(item));
  }
  const speedAnswersContainer = document.getElementById("speed-answers");
  const notesAnswersContainer = document.getElementById("notes-answers");
  if (speedAnswersContainer) shuffleAnswers(speedAnswersContainer);
  if (notesAnswersContainer) shuffleAnswers(notesAnswersContainer);

  const draggableItems = document.querySelectorAll(".draggable-item");
  const dropZones = document.querySelectorAll(".drop-zone");
  const totalDropZones = dropZones.length;

  draggableItems.forEach((item) => {
    item.addEventListener("dragstart", (event) => {
      if (!gameActive) {
        event.preventDefault();
        return;
      }
      event.dataTransfer.setData("text/plain", event.target.id);
      setTimeout(() => {
        event.target.classList.add("dragging");
      }, 0);
    });

    item.addEventListener("dragend", (event) => {
      event.target.classList.remove("dragging");
    });
  });

  dropZones.forEach((zoneDiv, index) => {
    const parentTd = zoneDiv.closest("td");
    if (!parentTd) {
      console.error(
        `Could not find parent TD for drop zone ${index}:`,
        zoneDiv
      );
      return;
    }

    parentTd.addEventListener("dragover", (event) => {
      const currentZoneDiv = parentTd.querySelector(".drop-zone");
      if (!currentZoneDiv) return;

      if (!gameActive || currentZoneDiv.classList.contains("filled")) {
        return;
      }
      event.preventDefault();

      if (!currentZoneDiv.classList.contains("filled")) {
        currentZoneDiv.classList.add("drag-over");
      }
    });

    parentTd.addEventListener("dragenter", (event) => {
      const currentZoneDiv = parentTd.querySelector(".drop-zone");
      if (
        !currentZoneDiv ||
        !gameActive ||
        currentZoneDiv.classList.contains("filled")
      ) {
        return;
      }
      event.preventDefault();
    });

    parentTd.addEventListener("dragleave", (event) => {
      const currentZoneDiv = parentTd.querySelector(".drop-zone");
      if (currentZoneDiv && !parentTd.contains(event.relatedTarget)) {
        currentZoneDiv.classList.remove("drag-over");
      }
    });

    parentTd.addEventListener("drop", (event) => {
      const currentZoneDiv = parentTd.querySelector(".drop-zone");
      if (!currentZoneDiv || !gameActive) {
        return;
      }

      event.preventDefault();
      currentZoneDiv.classList.remove("drag-over");

      const draggedItemId = event.dataTransfer.getData("text/plain");
      const draggedItem = document.getElementById(draggedItemId);

      if (!draggedItem) {
        console.error(
          "Drop Error: Could not find dragged item ID:",
          draggedItemId
        );
        return;
      }

      const acceptsValue = currentZoneDiv.dataset.accepts;
      const draggedItemValue = draggedItem.dataset.value;

      if (
        !currentZoneDiv.classList.contains("filled") &&
        acceptsValue === draggedItemValue
      ) {
        currentZoneDiv.appendChild(draggedItem);
        currentZoneDiv.classList.add("filled");
        draggedItem.style.marginBottom = "0";
        draggedItem.style.marginTop = "0";

        const filledZonesCount =
          document.querySelectorAll(".drop-zone.filled").length;
        if (filledZonesCount === totalDropZones && !confettiHasFired) {
          confettiHasFired = true;
          stopGame(true);
          try {
            confetti({
              particleCount: 150,
              spread: 100,
              origin: { y: 0.6 },
              zIndex: 10000,
            });
          } catch (e) {
            console.error(">>> Confetti error:", e);
          }
        }
      }
    });
  });

  updateTimerDisplay();
  timerInterval = setInterval(countdown, 1000);
});
