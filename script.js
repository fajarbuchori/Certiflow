/* ==========================================
   CERTIFYFLOW
   Bulk Certificate Generator
========================================== */


const state = {

  step: 1,

  event: {
    name: "",
    organizer: "",
    date: "",
    title: "Certificate of Participation",
    verificationUrl: ""
  },

  template: {
    image: null,

    nameX: 600,
    nameY: 400,

    qrX: 1010,
    qrY: 650,

    nameSize: 54,
    nameFont: "Manrope",
    nameAlign: "center",

    qrSize: 180,
    qrLabel: "Scan to verify"
  },

  participants: [],

  generated: []

};


/* ==========================================
   DOM HELPER
========================================== */

function $(id) {
  return document.getElementById(id);
}


/* ==========================================
   STEP SYSTEM
========================================== */

const panels = [
  $("panel1"),
  $("panel2"),
  $("panel3"),
  $("panel4")
];


const stepButtons = [
  ...document.querySelectorAll(".step")
];


function setStep(step) {

  state.step = step;


  panels.forEach((panel, index) => {

    panel.classList.toggle(
      "active",
      index === step - 1
    );

  });


  stepButtons.forEach((button, index) => {

    button.classList.toggle(
      "active",
      index === step - 1
    );

  });


  const titles = [

    [
      "01 / EVENT",
      "Set up your event"
    ],

    [
      "02 / TEMPLATE",
      "Prepare your certificate design"
    ],

    [
      "03 / PARTICIPANTS",
      "Import your participant list"
    ],

    [
      "04 / GENERATE",
      "Review and generate"
    ]

  ];


  $("sectionKicker").textContent =
    titles[step - 1][0];


  $("sectionTitle").textContent =
    titles[step - 1][1];


  $("progressText").textContent =
    `${step} of 4`;


  $("progressBar").style.width =
    `${step * 25}%`;


  if (step === 4) {
    updateReview();
  }

}


/* ==========================================
   EVENT
========================================== */

$("eventDate").valueAsDate =
  new Date();


$("eventNext").addEventListener(
  "click",
  () => {

    const eventName =
      $("eventName").value.trim();


    if (!eventName) {

      alert(
        "Silakan masukkan nama event terlebih dahulu."
      );

      $("eventName").focus();

      return;
    }


    state.event.name =
      eventName;


    state.event.organizer =
      $("organizer").value.trim();


    state.event.date =
      $("eventDate").value;


    state.event.title =
      $("certificateTitle").value.trim()
      ||
      "Certificate of Participation";


    state.event.verificationUrl =
      $("verificationUrl").value.trim();


    if (!state.event.verificationUrl) {

      alert(
        "Masukkan verification URL."
      );

      return;
    }


    setStep(2);

  }
);


/* ==========================================
   TEMPLATE UPLOAD
========================================== */

$("templateInput").addEventListener(
  "change",
  event => {

    const file =
      event.target.files[0];


    if (!file) {
      return;
    }


    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp"
    ];


    if (!allowedTypes.includes(file.type)) {

      alert(
        "Format template harus PNG, JPG, atau WebP."
      );

      return;
    }


    state.template.image =
      new Image();


    state.template.image.onload =
      () => {

        $("templateName").textContent =
          file.name;


        $("canvasPlaceholder").style.display =
          "none";


        drawCanvas();

        updateDragPositions();

      };


    state.template.image.src =
      URL.createObjectURL(file);

  }
);


/* ==========================================
   DRAW TEMPLATE
========================================== */

function drawCanvas() {
  const canvas = $("certificateCanvas");
  const ctx = canvas.getContext("2d");
  const image = state.template.image;

  if (!image) return;

  // Samakan rasio Canvas Preview persis sesuai Gambar Canva yang di-upload
  const imageAspect = image.width / image.height;
  
  // Lebar preview di layar kita set max 1000px, tingginya menyesuaikan rasio asli Canva
  const previewWidth = Math.min(1000, image.width);
  const previewHeight = previewWidth / imageAspect;

  canvas.width = previewWidth;
  canvas.height = previewHeight;

  // Draw template background
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  /* --- RENDER PREVIEW NAMA --- */
  ctx.save();
  ctx.font = `700 ${state.template.nameSize || 54}px "${state.template.nameFont || 'Arial'}", sans-serif`;
  ctx.fillStyle = "#171717";
  ctx.textAlign = state.template.nameAlign || "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Sample Participant", state.template.nameX, state.template.nameY);
  ctx.restore();

  /* --- RENDER PREVIEW QR --- */
  const qrSize = Number(state.template.qrSize) || 180;
  ctx.save();
  ctx.strokeStyle = "#007bff";
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  ctx.strokeRect(
    state.template.qrX - (qrSize / 2),
    state.template.qrY - (qrSize / 2),
    qrSize,
    qrSize
  );
  ctx.restore();

  ctx.save();
  ctx.font = "700 14px sans-serif";
  ctx.fillStyle = "#007bff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("QR", state.template.qrX, state.template.qrY);
  ctx.restore();
}


/* ==========================================
   DRAG ELEMENT POSITION
========================================== */

function updateDragPositions() {

  const canvas =
    $("certificateCanvas");


  const rect =
    canvas.getBoundingClientRect();


  const scaleX =
    rect.width / canvas.width;


  const scaleY =
    rect.height / canvas.height;


  $("nameElement").style.left =
    `${state.template.nameX * scaleX}px`;


  $("nameElement").style.top =
    `${state.template.nameY * scaleY}px`;


  $("qrElement").style.left =
    `${state.template.qrX * scaleX}px`;


  $("qrElement").style.top =
    `${state.template.qrY * scaleY}px`;


  $("namePosition").textContent =
    `NAME x: ${Math.round(state.template.nameX)} y: ${Math.round(state.template.nameY)}`;


  $("qrPosition").textContent =
    `QR x: ${Math.round(state.template.qrX)} y: ${Math.round(state.template.qrY)}`;

}


/* ==========================================
   DRAG SYSTEM
========================================== */

function makeDraggable(
  element,
  type
) {

  let dragging =
    false;


  element.addEventListener(
    "pointerdown",
    event => {

      dragging = true;

      element.setPointerCapture(
        event.pointerId
      );

    }
  );


  element.addEventListener(
    "pointermove",
    event => {

      if (!dragging) {
        return;
      }


      const canvas =
        $("certificateCanvas");


      const rect =
        canvas.getBoundingClientRect();


      const scaleX =
        canvas.width / rect.width;


      const scaleY =
        canvas.height / rect.height;


      const x =
        (event.clientX - rect.left)
        * scaleX;


      const y =
        (event.clientY - rect.top)
        * scaleY;


      if (type === "name") {

        state.template.nameX =
          Math.max(
            0,
            Math.min(
              canvas.width,
              x
            )
          );


        state.template.nameY =
          Math.max(
            0,
            Math.min(
              canvas.height,
              y
            )
          );

      }


      if (type === "qr") {

        const half =
          state.template.qrSize / 2;


        state.template.qrX =
          Math.max(
            half,
            Math.min(
              canvas.width - half,
              x
            )
          );


        state.template.qrY =
          Math.max(
            half,
            Math.min(
              canvas.height - half,
              y
            )
          );

      }


      drawCanvas();

      updateDragPositions();

    }
  );


  element.addEventListener(
    "pointerup",
    () => {

      dragging = false;

    }
  );

}


makeDraggable(
  $("nameElement"),
  "name"
);


makeDraggable(
  $("qrElement"),
  "qr"
);


/* ==========================================
   TEMPLATE CONTROLS
========================================== */

[
  "nameSize",
  "nameFont",
  "nameAlign",
  "qrSize",
  "qrLabel"
].forEach(id => {

  $(id).addEventListener(
    "input",
    () => {

      state.template.nameSize =
        Number(
          $("nameSize").value
        ) || 54;


      state.template.nameFont =
        $("nameFont").value;


      state.template.nameAlign =
        $("nameAlign").value;


      state.template.qrSize =
        Number(
          $("qrSize").value
        ) || 180;


      state.template.qrLabel =
        $("qrLabel").value;


      drawCanvas();

      updateDragPositions();

    }
  );

});


$("templateNext").addEventListener(
  "click",
  () => {

    if (!state.template.image) {

      alert(
        "Silakan upload desain sertifikat terlebih dahulu."
      );

      return;
    }


    setStep(3);

  }
);


/* ==========================================
   BACK BUTTON
========================================== */

document
  .querySelectorAll("[data-back]")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        setStep(
          Math.max(
            1,
            state.step - 1
          )
        );

      }
    );

  });


/* ==========================================
   SAMPLE CSV
========================================== */

$("downloadSample").addEventListener(
  "click",
  () => {

    const csv =
`name,email
Fajar,fajar@example.com
Budi,budi@example.com
Andi,andi@example.com
Sinta,sinta@example.com`;


    const blob =
      new Blob(
        [csv],
        {
          type: "text/csv"
        }
      );


    const url =
      URL.createObjectURL(blob);


    const link =
      document.createElement("a");


    link.href =
      url;


    link.download =
      "participants-sample.csv";


    link.click();


    URL.revokeObjectURL(url);

  }
);


/* ==========================================
   CSV IMPORT
========================================== */

$("csvInput").addEventListener(
  "change",
  async event => {

    const file =
      event.target.files[0];


    if (!file) {
      return;
    }


    $("csvName").textContent =
      file.name;


    const text =
      await file.text();


    const rows =
      parseCSV(text);


    if (!rows.length) {

      alert(
        "CSV tidak memiliki data."
      );

      return;
    }


    const participants =
      rows.map(
        (row, index) => {

          const name =
            (
              row.name ||
              row.nama ||
              ""
            ).trim();


          const email =
            (
              row.email ||
              row.gmail ||
              ""
            ).trim();


          return {

            name,

            email,

            row:
              index + 2,

            credentialId:
              generateCredentialId()

          };

        }
      );


    const invalidRows =
      participants.filter(
        participant =>
          !participant.name ||
          !isValidEmail(
            participant.email
          )
      );


    if (invalidRows.length) {

      $("csvStatus").textContent =
        `${invalidRows.length} invalid row(s)`;


      $("csvStatus").style.color =
        "var(--danger)";

    } else {

      $("csvStatus").textContent =
        "CSV valid";


      $("csvStatus").style.color =
        "var(--success)";

    }


    state.participants =
      participants;


    renderParticipants();

  }
);


/* ==========================================
   CSV PARSER
========================================== */

function parseCSV(text) {

  const lines =
    text
      .replace(/^\uFEFF/, "")
      .split(/\r?\n/)
      .filter(
        line =>
          line.trim() !== ""
      );


  if (!lines.length) {
    return [];
  }


  const headers =
    splitCSVLine(
      lines[0]
    ).map(
      header =>
        header
          .trim()
          .toLowerCase()
    );


  return lines
    .slice(1)
    .map(line => {

      const cells =
        splitCSVLine(line);


      const row = {};


      headers.forEach(
        (header, index) => {

          row[header] =
            cells[index] || "";

        }
      );


      return row;

    });

}


/* ==========================================
   CSV LINE PARSER
========================================== */

function splitCSVLine(line) {

  const result = [];

  let current = "";

  let quoted = false;


  for (
    let index = 0;
    index < line.length;
    index++
  ) {

    const character =
      line[index];


    if (
      character === '"' &&
      line[index + 1] === '"'
    ) {

      current += '"';

      index++;

      continue;

    }


    if (character === '"') {

      quoted =
        !quoted;

      continue;

    }


    if (
      character === "," &&
      !quoted
    ) {

      result.push(current);

      current = "";

    } else {

      current += character;

    }

  }


  result.push(current);


  return result;

}


/* ==========================================
   EMAIL VALIDATION
========================================== */

function isValidEmail(email) {

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    .test(email);

}


/* ==========================================
   CREDENTIAL ID
========================================== */

function generateCredentialId() {

  const characters =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";


  const values =
    new Uint32Array(8);


  crypto.getRandomValues(
    values
  );


  let random =
    "";


  values.forEach(value => {

    random +=
      characters[
        value %
        characters.length
      ];

  });


  return `CERT-${new Date().getFullYear()}-${random}`;

}


/* ==========================================
   PARTICIPANT TABLE
========================================== */

function renderParticipants() {

  $("participantCount").textContent =
    `${state.participants.length} participants`;


  if (!state.participants.length) {

    $("participantTable").innerHTML = `
      <tr>
        <td
          colspan="4"
          class="empty-row"
        >
          No participants.
        </td>
      </tr>
    `;

    return;
  }


  $("participantTable").innerHTML =
    state.participants
      .map(
        (participant, index) => {

          return `
            <tr>

              <td>
                ${index + 1}
              </td>

              <td>
                ${escapeHTML(
                  participant.name
                )}
              </td>

              <td>
                ${escapeHTML(
                  participant.email
                )}
              </td>

              <td class="credential">
                ${participant.credentialId}
              </td>

            </tr>
          `;

        }
      )
      .join("");

}


/* ==========================================
   ESCAPE HTML
========================================== */

function escapeHTML(value) {

  return String(value)
    .replace(
      /[&<>"']/g,
      character => {

        const entities = {

          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;"

        };


        return entities[
          character
        ];

      }
    );

}


/* ==========================================
   PARTICIPANTS NEXT
========================================== */

$("participantsNext").addEventListener(
  "click",
  () => {

    if (!state.participants.length) {

      alert(
        "Silakan import CSV peserta terlebih dahulu."
      );

      return;
    }


    const invalid =
      state.participants.filter(
        participant =>
          !participant.name ||
          !isValidEmail(
            participant.email
          )
      );


    if (invalid.length) {

      alert(
        "Masih ada data peserta yang tidak valid."
      );

      return;
    }


    setStep(4);

  }
);


/* ==========================================
   REVIEW
========================================== */

function updateReview() {

  $("reviewTitle").textContent =
    state.event.title;


  $("reviewCount").textContent =
    state.participants.length;


  $("reviewEvent").textContent =
    state.event.name || "—";


  $("reviewOrganizer").textContent =
    state.event.organizer || "—";


  $("reviewTemplate").textContent =
    $("templateName").textContent;


  $("reviewRecipients").textContent =
    `${state.participants.length} email recipient(s)`;

}


/* ==========================================
   GENERATE BATCH
========================================== */

$("generateButton").addEventListener(
  "click",
  generateCertificates
);


async function generateCertificates() {
  if (
    !state.template.image ||
    !state.participants.length
  ) {
    alert(
      "Template dan participant wajib tersedia."
    );

    return;
  }

  const generateButton =
    $("generateButton");

  generateButton.disabled = true;

  $("resultStatus").textContent =
    "Generating";

  $("resultStatus").className =
    "status-tag running";

  $("generationProgress").style.width =
    "0%";

  $("resultNumber").innerHTML =
    `0 <small>/ ${state.participants.length}</small>`;

  $("resultMessage").textContent =
    "Preparing certificates...";

  $("downloadZip").disabled = true;

  state.generated = [];

  const zip = new JSZip();

  try {
    for (
      let index = 0;
      index < state.participants.length;
      index++
    ) {
      const participant =
        state.participants[index];

      $("resultMessage").textContent =
        `Generating ${participant.name}...`;

      const pdf =
        await createCertificatePDF(
          participant
        );

      const pdfData =
        pdf.output("arraybuffer");

      const safeName =
        sanitizeFilename(
          participant.name
        );

      const filename =
        `${safeName}-${participant.credentialId}.pdf`;

      zip.file(
        filename,
        pdfData
      );

      state.generated.push({
        participant,
        filename
      });

      const progress =
        ((index + 1) /
          state.participants.length) *
        100;

      $("generationProgress").style.width =
        `${progress}%`;

      $("resultNumber").innerHTML =
        `${index + 1} <small>/ ${state.participants.length}</small>`;

      await sleep(50);
    }

    $("resultMessage").textContent =
      "Creating ZIP file...";

    const zipBlob =
      await zip.generateAsync(
        {
          type: "blob",
          compression: "DEFLATE",
          compressionOptions: {
            level: 6
          }
        },
        metadata => {
          $("generationProgress").style.width =
            `${metadata.percent}%`;
        }
      );

    const zipUrl =
      URL.createObjectURL(
        zipBlob
      );

    const downloadButton =
      $("downloadZip");

    downloadButton.disabled = false;

    downloadButton.onclick = () => {
      const link =
        document.createElement("a");

      link.href =
        zipUrl;

      link.download =
        `${sanitizeFilename(
          state.event.name
        )}-certificates.zip`;

      document.body.appendChild(link);

      link.click();

      link.remove();
    };

    $("resultStatus").textContent =
      "Complete";

    $("resultStatus").className =
      "status-tag success";

    $("resultMessage").textContent =
      `All ${state.participants.length} certificates generated successfully.`;

  } catch (error) {
    console.error(
      "Certificate generation error:",
      error
    );

    $("resultStatus").textContent =
      "Error";

    $("resultStatus").className =
      "status-tag";

    $("resultMessage").textContent =
      `Generation gagal: ${error.message}`;

    alert(
      `Gagal membuat sertifikat:\n\n${error.message}`
    );

  } finally {
    generateButton.disabled = false;
  }
}


/* ==========================================
   CREATE PDF (Support 5 Presets Ukuran Populer)
========================================== */

async function createCertificatePDF(participant) {
  const jsPDF = window.jspdf?.jsPDF || window.jsPDF;
  if (!jsPDF) throw new Error("Library jsPDF belum dimuat.");

  const image = state.template.image;
  if (!image) throw new Error("Template sertifikat belum tersedia.");

  const canvas = $("certificateCanvas");
  if (!canvas || !canvas.width) throw new Error("Canvas preview belum siap.");

  // Baca Pilihan Ukuran dari Dropdown HTML
  const sizeSelect = $("certSizeSelect")?.value || "a4_landscape";

  let pdfWidth, pdfHeight, orientation, unit, formatParam;

  switch (sizeSelect) {
    case "a4_portrait":
      pdfWidth = 210;
      pdfHeight = 297;
      orientation = "portrait";
      unit = "mm";
      formatParam = "a4";
      break;

    case "us_letter_landscape":
      pdfWidth = 279.4;
      pdfHeight = 215.9;
      orientation = "landscape";
      unit = "mm";
      formatParam = "letter";
      break;

    case "fhd_1080p":
      pdfWidth = 1920;
      pdfHeight = 1080;
      orientation = "landscape";
      unit = "px";
      formatParam = [1920, 1080];
      break;

    case "f4_folio_landscape":
      pdfWidth = 330;
      pdfHeight = 215;
      orientation = "landscape";
      unit = "mm";
      formatParam = [330, 215];
      break;

    case "custom_image":
      pdfWidth = image.naturalWidth || image.width;
      pdfHeight = image.naturalHeight || image.height;
      orientation = pdfWidth >= pdfHeight ? "landscape" : "portrait";
      unit = "px";
      formatParam = [pdfWidth, pdfHeight];
      break;

    case "a4_landscape":
    default:
      pdfWidth = 297;
      pdfHeight = 210;
      orientation = "landscape";
      unit = "mm";
      formatParam = "a4";
      break;
  }

  // Buat Dokumen PDF Sesuai Preset Pilihan
  const pdf = new jsPDF({
    orientation: orientation,
    unit: unit,
    format: formatParam,
    hotfixes: unit === "px" ? ["px_scaling"] : []
  });

  // Render Background Gambar
  const bgCanvas = document.createElement("canvas");
  bgCanvas.width = image.naturalWidth || image.width;
  bgCanvas.height = image.naturalHeight || image.height;
  const bgCtx = bgCanvas.getContext("2d");
  bgCtx.drawImage(image, 0, 0, bgCanvas.width, bgCanvas.height);

  pdf.addImage(
    bgCanvas.toDataURL("image/png"),
    "PNG",
    0,
    0,
    pdfWidth,
    pdfHeight
  );

  // SKALA KONVERSI: Dari Preview Canvas ke Ukuran PDF
  const scaleX = pdfWidth / canvas.width;
  const scaleY = pdfHeight / canvas.height;

  /* 1. CETAK NAMA */
  const fontSizeFactor = unit === "mm" ? (pdfHeight / canvas.height) * 2.835 : scaleX;
  const pdfFontSize = (Number(state.template.nameSize) || 54) * fontSizeFactor;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(pdfFontSize);
  pdf.setTextColor(23, 23, 23);

  const nameXTarget = state.template.nameX * scaleX;
  const nameYTarget = state.template.nameY * scaleY;

  pdf.text(
    participant.name,
    nameXTarget,
    nameYTarget,
    {
      align: state.template.nameAlign || "center",
      baseline: "middle"
    }
  );

  /* 2. CETAK QR CODE */
  const verificationURL = createVerificationURL(participant.credentialId);
  const qrSizePx = Number(state.template.qrSize) || 180;
  const qrSizeTarget = qrSizePx * scaleX;

  const qrCanvas = await generateQR(verificationURL, qrSizePx * 2);
  const qrData = qrCanvas.toDataURL("image/png");

  const qrXTarget = (state.template.qrX * scaleX) - (qrSizeTarget / 2);
  const qrYTarget = (state.template.qrY * scaleY) - (qrSizeTarget / 2);

  pdf.addImage(
    qrData,
    "PNG",
    qrXTarget,
    qrYTarget,
    qrSizeTarget,
    qrSizeTarget
  );

  /* 3. CETAK LABEL QR */
  if (state.template.qrLabel && state.template.qrLabel.trim()) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(unit === "mm" ? 10 : 14 * scaleX);
    pdf.setTextColor(80, 80, 80);

    pdf.text(
      state.template.qrLabel,
      state.template.qrX * scaleX,
      qrYTarget + qrSizeTarget + (unit === "mm" ? 5 : 18 * scaleY),
      {
        align: "center"
      }
    );
  }

  return pdf;
}

/* ==========================================
   QR
========================================== */

function generateQR(text, size) {
  return new Promise((resolve, reject) => {
    const container = document.createElement("div");

    container.style.position = "fixed";
    container.style.left = "-99999px";
    container.style.top = "0";
    container.style.width = `${size}px`;
    container.style.height = `${size}px`;

    document.body.appendChild(container);

    try {
      new QRCode(container, {
        text,
        width: size,
        height: size,
        correctLevel: QRCode.CorrectLevel.M
      });

      setTimeout(() => {
        const canvas = container.querySelector("canvas");

        if (!canvas) {
          const image = container.querySelector("img");

          if (!image) {
            container.remove();
            reject(new Error("QR code gagal dibuat."));
            return;
          }

          const qrCanvas = document.createElement("canvas");

          qrCanvas.width = size;
          qrCanvas.height = size;

          const context = qrCanvas.getContext("2d");

          image.onload = () => {
            context.drawImage(
              image,
              0,
              0,
              size,
              size
            );

            container.remove();
            resolve(qrCanvas);
          };

          if (image.complete) {
            context.drawImage(
              image,
              0,
              0,
              size,
              size
            );

            container.remove();
            resolve(qrCanvas);
          }

          return;
        }

        container.remove();
        resolve(canvas);
      }, 100);
    } catch (error) {
      container.remove();
      reject(error);
    }
  });
}

/* ==========================================
   VERIFICATION URL
========================================== */

function createVerificationURL(
  credentialId
) {

  let base =
    state.event.verificationUrl;


  if (!base.endsWith("/")) {

    base += "/";

  }


  return (
    base +
    encodeURIComponent(
      credentialId
    )
  );

}


/* ==========================================
   HELPERS
========================================== */

function sanitizeFilename(
  value
) {

  return String(
    value || "certificate"
  )
    .replace(
      /[^\w\s-]/g,
      ""
    )
    .trim()
    .replace(
      /\s+/g,
      "-"
    )
    .toLowerCase();

}


function sleep(
  milliseconds
) {

  return new Promise(
    resolve =>
      setTimeout(
        resolve,
        milliseconds
      )
  );

}


/* ==========================================
   NEW BATCH
========================================== */

$("newBatch").addEventListener(
  "click",
  () => {

    const confirmed =
      confirm(
        "Mulai batch baru?"
      );


    if (confirmed) {

      location.reload();

    }

  }
);


/* ==========================================
   RESIZE
========================================== */

window.addEventListener(
  "resize",
  () => {

    updateDragPositions();

  }
);


/* ==========================================
   INITIALIZE
========================================== */

setStep(1);