document.addEventListener("DOMContentLoaded", function(){

  /* ============================= */
  /* ===== PDF SECTION ========= */
  /* ============================= */

  const filesInput = document.getElementById("images");
  const btn = document.getElementById("createPdf");
  const bar = document.getElementById("progressBar");
  const nameInput = document.getElementById("pdfName");
  const fileCountText = document.getElementById("fileCount");

  if (btn && filesInput) {

    const { jsPDF } = window.jspdf;

    btn.onclick = async () => {

      applyManualSort(); // ✅ เพิ่มบรรทัดนี้

      const files = filesInput.files;
      if (!files.length) return alert("Select images first");

      const pdf = new jsPDF();
      const name = nameInput.value || "document";

      bar.style.width = "0%";

      for (let i = 0; i < files.length; i++) {
        const img = await loadImage(files[i]);

        const w = pdf.internal.pageSize.getWidth();
        const h = (img.height * w) / img.width;

        if (i > 0) pdf.addPage();
        pdf.addImage(img, "JPEG", 0, 0, w, h);

        bar.style.width = ((i + 1) / files.length) * 100 + "%";
      }

      pdf.save(name + ".pdf");
    };

    function loadImage(file){
      return new Promise(resolve=>{
        const reader = new FileReader();
        reader.onload = ()=>{
          const img = new Image();
          img.onload = ()=>resolve(img);
          img.src = reader.result;
        };
        reader.readAsDataURL(file);
      });
    }

    filesInput.addEventListener("change", () => {
      const count = filesInput.files.length;

      if (fileCountText) {
        fileCountText.textContent =
          count === 0
            ? ""
            : `Selected ${count} image${count > 1 ? "s" : ""}`;
      }
    });

    /* ============================= */
    /* ===== SORT SYSTEM (ADD) ==== */
    /* ============================= */

    let sortedFiles = [];

    filesInput.addEventListener("change", () => {
      sortedFiles = Array.from(filesInput.files);
      renderPreview();
    });

    function renderPreview() {
      const container = document.getElementById("previewContainer");
      if (!container) return;

      container.innerHTML = "";

      sortedFiles.forEach((file, index) => {
        const reader = new FileReader();

        reader.onload = (e) => {
          const div = document.createElement("div");
          div.draggable = true;
          div.dataset.index = index;
          div.style.display = "inline-block";
          div.style.margin = "5px";
          div.style.cursor = "grab";

          div.innerHTML = `
            <img src="${e.target.result}" 
                 style="width:80px;border-radius:8px;border:1px solid #ccc;display:block;margin-bottom:4px;">
            <input type="number" 
                   value="${index+1}" 
                   min="1"
                   style="width:60px;text-align:center;">
          `;

          /* === CLICK TO VIEW LARGE === */
          div.querySelector("img").addEventListener("click", (ev) => {
            ev.stopPropagation();
            openLargeImage(ev.target.src);
          });

          div.addEventListener("dragstart", () => {
            div.classList.add("dragging");
          });

          div.addEventListener("dragend", () => {
            div.classList.remove("dragging");
          });

          div.addEventListener("dragover", (e) => {
            e.preventDefault();
          });

          div.addEventListener("drop", () => {
            const dragging = document.querySelector(".dragging");
            if (!dragging) return;

            const from = dragging.dataset.index;
            const to = div.dataset.index;

            swapFiles(from, to);
            updateInputFiles();
            renderPreview();
          });

          container.appendChild(div);
        };

        reader.readAsDataURL(file);
      });
    }

    function swapFiles(from, to) {
      const temp = sortedFiles[from];
      sortedFiles[from] = sortedFiles[to];
      sortedFiles[to] = temp;
    }

    function updateInputFiles() {
      const dataTransfer = new DataTransfer();
      sortedFiles.forEach(file => dataTransfer.items.add(file));
      filesInput.files = dataTransfer.files;
    }

    /* ============================= */
    /* ===== MANUAL SORT ADD ===== */
    /* ============================= */

    function applyManualSort() {
      const container = document.getElementById("previewContainer");
      const inputs = container.querySelectorAll("input[type='number']");

      let tempArray = [];

      inputs.forEach((input, index) => {
        tempArray.push({
          order: parseInt(input.value) || 0,
          file: sortedFiles[index]
        });
      });

      tempArray.sort((a, b) => a.order - b.order);

      sortedFiles = tempArray.map(item => item.file);

      updateInputFiles();
      renderPreview();
    }

    /* ============================= */
    /* ===== IMAGE LARGE VIEW ===== */
    /* ============================= */

    const imageModal = document.getElementById("imagePreviewModal");
    const largeImage = document.getElementById("previewLargeImage");

    function openLargeImage(src) {
      if (!imageModal || !largeImage) return;
      largeImage.src = src;
      imageModal.style.display = "flex";
      document.body.style.overflow = "hidden";
    }

    function closeLargeImage() {
      if (!imageModal) return;
      imageModal.style.display = "none";
      document.body.style.overflow = "auto";
    }

    if (imageModal) {
      imageModal.addEventListener("click", closeLargeImage);
    }

  }

  /* ============================= */
  /* ===== SIDE MENU ============ */
  /* ============================= */

  const menuToggle = document.getElementById("menuToggle");
  const sideMenu = document.getElementById("sideMenu");
  const overlay = document.getElementById("overlay");

  if (menuToggle && sideMenu && overlay) {
    menuToggle.addEventListener("click",()=>{
      sideMenu.classList.toggle("active");
      overlay.classList.toggle("active");
    });

    overlay.addEventListener("click",()=>{
      sideMenu.classList.remove("active");
      overlay.classList.remove("active");
    });
  }

  /* ============================= */
  /* ===== PDF MODAL ============ */
  /* ============================= */

  const openBtn = document.getElementById("openPdf");
  const modal = document.getElementById("pdfModal");
  const closeBtn = document.getElementById("closePdf");

  if (openBtn && modal && closeBtn) {

    openBtn.addEventListener("click", (e) => {
      e.preventDefault();
      modal.classList.add("active");
      document.body.style.overflow = "hidden";
    });

    closeBtn.addEventListener("click", () => {
      modal.classList.remove("active");
      document.body.style.overflow = "auto";
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("active");
        document.body.style.overflow = "auto";
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        modal.classList.remove("active");
        document.body.style.overflow = "auto";
      }
    });

  }

});