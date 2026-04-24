// ========================================
// GPA Calculator — Main Script
// ========================================

const GRADE_SCALE = {
    "A":  4.0,
    "A-": 3.7,
    "B+": 3.3,
    "B":  3.0,
    "B-": 2.7,
    "C+": 2.3,
    "C":  2.0,
    "C-": 1.7,
    "D+": 1.3,
    "D":  1.0,
    "F":  0.0,
};

// --- DOM references ---
const courseList     = document.getElementById("course-list");
const addCourseBtn   = document.getElementById("add-course-btn");
const resetBtn       = document.getElementById("reset-btn");
const prevGpaInput   = document.getElementById("prev-gpa");
const prevCredInput  = document.getElementById("prev-credits");
const themeToggle    = document.getElementById("theme-toggle");

const totalCreditsEl = document.getElementById("total-credits");
const totalPointsEl  = document.getElementById("total-points");
const semesterGpaEl  = document.getElementById("semester-gpa");
const cumulGpaEl     = document.getElementById("cumulative-gpa");
const semesterBarEl  = document.getElementById("semester-bar");
const cumulBarEl     = document.getElementById("cumulative-bar");

// --- Theme toggle ---
function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("gpa-theme", theme);
}

themeToggle.addEventListener("click", function () {
    const current = document.documentElement.getAttribute("data-theme");
    setTheme(current === "dark" ? "light" : "dark");
});

// Load saved theme
const savedTheme = localStorage.getItem("gpa-theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
setTheme(savedTheme);

// --- Create a single course row ---
function createCourseRow() {
    const row = document.createElement("div");
    row.className = "course-row";

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.className = "course-name";
    nameInput.placeholder = "Course name";

    const creditInput = document.createElement("input");
    creditInput.type = "number";
    creditInput.className = "course-credits";
    creditInput.placeholder = "Credits";
    creditInput.min = "0";
    creditInput.max = "10";
    creditInput.step = "1";

    const gradeSelect = document.createElement("select");
    gradeSelect.className = "course-grade";

    const defaultOpt = document.createElement("option");
    defaultOpt.value = "";
    defaultOpt.textContent = "Grade";
    defaultOpt.disabled = true;
    defaultOpt.selected = true;
    gradeSelect.appendChild(defaultOpt);

    for (const grade of Object.keys(GRADE_SCALE)) {
        const opt = document.createElement("option");
        opt.value = grade;
        opt.textContent = grade + "  (" + GRADE_SCALE[grade].toFixed(1) + ")";
        gradeSelect.appendChild(opt);
    }

    const removeBtn = document.createElement("button");
    removeBtn.className = "btn-remove";
    removeBtn.title = "Remove course";
    removeBtn.textContent = "\u00d7";

    removeBtn.addEventListener("click", function () {
        if (courseList.children.length > 1) {
            row.style.animation = "slideOut 0.2s ease forwards";
            row.addEventListener("animationend", function () {
                row.remove();
                calculateGPA();
            });
        }
    });

    creditInput.addEventListener("input", calculateGPA);
    gradeSelect.addEventListener("change", calculateGPA);

    row.appendChild(nameInput);
    row.appendChild(creditInput);
    row.appendChild(gradeSelect);
    row.appendChild(removeBtn);

    return row;
}

// --- Apply GPA color class ---
function applyGpaClass(el, gpa) {
    el.classList.remove("gpa-low", "gpa-mid", "gpa-good", "gpa-great");
    if (gpa <= 0) return;
    if (gpa < 2.0) el.classList.add("gpa-low");
    else if (gpa < 3.0) el.classList.add("gpa-mid");
    else if (gpa < 3.5) el.classList.add("gpa-good");
    else el.classList.add("gpa-great");
}

// --- Calculate and display GPA ---
function calculateGPA() {
    let totalCredits = 0;
    let totalGradePoints = 0;

    const rows = courseList.querySelectorAll(".course-row");
    rows.forEach(function (row) {
        const creditInput = row.querySelector(".course-credits");
        const gradeSelect = row.querySelector(".course-grade");

        const credits = parseFloat(creditInput.value);
        const grade   = gradeSelect.value;

        if (!credits || credits <= 0 || isNaN(credits)) {
            creditInput.classList.toggle("invalid", creditInput.value !== "" && (credits <= 0 || isNaN(credits)));
            return;
        }

        creditInput.classList.remove("invalid");

        if (grade === "" || !(grade in GRADE_SCALE)) {
            return;
        }

        totalCredits += credits;
        totalGradePoints += credits * GRADE_SCALE[grade];
    });

    const semesterGpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0;

    totalCreditsEl.textContent = totalCredits;
    totalPointsEl.textContent  = totalGradePoints.toFixed(2);
    semesterGpaEl.textContent  = semesterGpa.toFixed(2);

    applyGpaClass(semesterGpaEl, semesterGpa);
    semesterBarEl.style.width = (semesterGpa / 4.0 * 100) + "%";

    // Cumulative GPA
    const prevGpa     = parseFloat(prevGpaInput.value) || 0;
    const prevCredits = parseFloat(prevCredInput.value) || 0;

    const prevGradePoints = prevGpa * prevCredits;
    const cumCredits      = prevCredits + totalCredits;
    const cumGradePoints  = prevGradePoints + totalGradePoints;
    const cumulGpa        = cumCredits > 0 ? cumGradePoints / cumCredits : 0;

    cumulGpaEl.textContent = cumulGpa.toFixed(2);
    applyGpaClass(cumulGpaEl, cumulGpa);
    cumulBarEl.style.width = (cumulGpa / 4.0 * 100) + "%";
}

// --- Add Course button ---
addCourseBtn.addEventListener("click", function () {
    courseList.appendChild(createCourseRow());
});

// --- Reset button ---
resetBtn.addEventListener("click", function () {
    courseList.innerHTML = "";
    courseList.appendChild(createCourseRow());
    prevGpaInput.value  = "";
    prevCredInput.value = "";
    calculateGPA();
});

// --- Recalculate when previous GPA/credits change ---
prevGpaInput.addEventListener("input", calculateGPA);
prevCredInput.addEventListener("input", calculateGPA);

// --- Inject slide-out animation ---
const style = document.createElement("style");
style.textContent = "@keyframes slideOut { to { opacity: 0; transform: translateY(-8px); height: 0; padding: 0; margin: 0; overflow: hidden; } }";
document.head.appendChild(style);

// --- Initialize ---
courseList.appendChild(createCourseRow());
