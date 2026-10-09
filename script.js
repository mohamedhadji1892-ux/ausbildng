// ========================================
// 1. HTML-Elemente auswählen
// ========================================

const form = document.getElementById("application-form");

const sections = document.querySelectorAll(".form-section");

const previousButton = document.getElementById("previous-button");
const nextButton = document.getElementById("next-button");
const submitButton = document.getElementById("submit-button");

const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");

const resultSection = document.getElementById("result");
const summaryElement = document.getElementById("summary");

const copyButton = document.getElementById("copy-button");
const downloadButton = document.getElementById("download-button");


// ========================================
// 2. Einstellungen
// ========================================

const STORAGE_KEY = "ausbildungApplication2027";

let currentSection = 0;


// ========================================
// 3. Abschnitt anzeigen
// ========================================

function showSection(index) {
    sections.forEach((section, i) => {
        section.classList.toggle("active", i === index);
    });

    currentSection = index;

    previousButton.disabled = index === 0;

    nextButton.classList.toggle(
        "hidden",
        index === sections.length - 1
    );

    submitButton.classList.toggle(
        "hidden",
        index !== sections.length - 1
    );

    const progress = ((index + 1) / sections.length) * 100;

    progressBar.style.width = `${progress}%`;

    progressText.textContent =
        `Abschnitt ${index + 1} von ${sections.length}`;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ========================================
// 4. Eingaben des aktuellen Abschnitts prüfen
// ========================================

function validateCurrentSection() {
    const currentFields =
        sections[currentSection].querySelectorAll(
            "input, select, textarea"
        );

    for (const field of currentFields) {
        if (!field.checkValidity()) {
            field.reportValidity();
            field.focus();
            return false;
        }
    }

    return true;
}


// ========================================
// 5. Zum nächsten Abschnitt wechseln
// ========================================

nextButton.addEventListener("click", () => {
    if (!validateCurrentSection()) {
        return;
    }

    saveFormData();

    if (currentSection < sections.length - 1) {
        showSection(currentSection + 1);
    }
});


// ========================================
// 6. Zum vorherigen Abschnitt wechseln
// ========================================

previousButton.addEventListener("click", () => {
    if (currentSection > 0) {
        saveFormData();
        showSection(currentSection - 1);
    }
});


// ========================================
// 7. Formular speichern
// ========================================

function saveFormData() {
    const formData = new FormData(form);

    const data = Object.fromEntries(formData.entries());

    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(data)
        );
    } catch (error) {
        console.warn(
            "Die Formulardaten konnten nicht gespeichert werden.",
            error
        );
    }
}


// ========================================
// 8. Gespeicherte Daten wiederherstellen
// ========================================

function loadFormData() {
    let savedData;

    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return;
        }

        savedData = JSON.parse(saved);
    } catch (error) {
        console.warn(
            "Gespeicherte Daten konnten nicht gelesen werden.",
            error
        );

        return;
    }

    for (const [name, value] of Object.entries(savedData)) {
        const field = form.elements.namedItem(name);

        if (field && "value" in field) {
            field.value = value;
        }
    }
}


// ========================================
// 9. Änderungen automatisch speichern
// ========================================

form.addEventListener("input", () => {
    saveFormData();
});

form.addEventListener("change", () => {
    saveFormData();
});


// ========================================
// 10. Bewerbungsprofil erstellen
// ========================================

form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validateCurrentSection()) {
        return;
    }

    saveFormData();

    const formData = new FormData(form);

    const data = Object.fromEntries(formData.entries());

    const labels = {
        firstName: "Vorname",
        lastName: "Nachname",
        birthDate: "Geburtsdatum",
        nationality: "Staatsangehörigkeit",
        email: "E-Mail-Adresse",
        country: "Aktuelles Wohnland",
        schoolDegree: "Schulabschluss",
        graduationYear: "Abschlussjahr",
        grade: "Abschlussnote",
        schoolCountry: "Land des Schulabschlusses",
        profession: "Wunschausbildung",
        startYear: "Startjahr",
        startMonth: "Startmonat",
        city: "Bevorzugte Region",
        germanLevel: "Deutschniveau",
        certificate: "Sprachzertifikat",
        skills: "IT-Kenntnisse",
        motivation: "Motivation"
    };

    const lines = [
        "MEIN AUSBILDUNGS-BEWERBUNGSPROFIL",
        "==================================",
        ""
    ];

    for (const [key, label] of Object.entries(labels)) {
        const value = data[key]?.trim() || "Keine Angabe";

        lines.push(`${label}: ${value}`);
        lines.push("");
    }

    lines.push(
        "Hinweis: Dieses Profil ist eine persönliche Vorbereitung."
    );

    summaryElement.textContent = lines.join("\n");

    resultSection.classList.remove("hidden");

    resultSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});


// ========================================
// 11. Zusammenfassung kopieren
// ========================================

copyButton.addEventListener("click", async () => {
    const text = summaryElement.textContent;

    try {
        await navigator.clipboard.writeText(text);

        copyButton.textContent = "Erfolgreich kopiert!";

        setTimeout(() => {
            copyButton.textContent = "Zusammenfassung kopieren";
        }, 2000);

    } catch (error) {
        window.alert(
            "Kopieren nicht möglich. Bitte markiere den Text und kopiere ihn manuell."
        );
    }
});


// ========================================
// 12. Zusammenfassung herunterladen
// ========================================

downloadButton.addEventListener("click", () => {
    const text = summaryElement.textContent;

    const file = new Blob(
        ["\uFEFF", text],
        { type: "text/plain;charset=utf-8" }
    );

    const url = URL.createObjectURL(file);

    const link = document.createElement("a");

    link.href = url;
    link.download = "Ausbildung-Bewerbungsprofil.txt";

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);
});


// ========================================
// 13. Anwendung starten
// ========================================

loadFormData();

showSection(0);