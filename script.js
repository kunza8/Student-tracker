// ========================================
// GPA Calculator — Main Script
// ========================================

// --- Grade scale mapping (letter grade → grade points) ---
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

// Result displays
const totalCreditsEl = document.getElementById("total-credits");
const totalPointsEl  = document.getElementById("total-points");
const semesterGpaEl  = document.getElementById("semester-gpa");
const cumulGpaEl     = document.getElementById("cumulative-gpa");

// --- Create a single course row and return its element ---
function createCourseRow() {
    const row = document.createElement("div");
    row.className = "course-row";

    // Course name input
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.className = "course-name";
    nameInput.placeholder = "Course name";

    // Credit hours input
    const creditInput = document.createElement("input");
    creditInput.type = "number";
    creditInput.className = "course-credits";
    creditInput.placeholder = "Credits";
    creditInput.min = "0";
    creditInput.max = "10";
    creditInput.step = "1";

    // Grade dropdown
    const gradeSelect = document.createElement("select");
    gradeSelect.className = "course-grade";

    // Default placeholder option
    const defaultOpt = document.createElement("option");
    defaultOpt.value = "";
    defaultOpt.textContent = "Grade";
    defaultOpt.disabled = true;
    defaultOpt.selected = true;
    gradeSelect.appendChild(defaultOpt);

    // Add each grade option
    for (const grade of Object.keys(GRADE_SCALE)) {
        const opt = document.createElement("option");
        opt.value = grade;
        opt.textContent = `${grade}  (${GRADE_SCALE[grade].toFixed(1)})`;
        gradeSelect.appendChild(opt);
    }

    // Remove button
    const removeBtn = document.createElement("button");
    removeBtn.className = "btn-remove";
    removeBtn.title = "Remove course";
    removeBtn.textContent = "\u00d7"; // × symbol

    // Remove row on click (keep at least one row)
    removeBtn.addEventListener("click", function () {
        if (courseList.children.length > 1) {
            row.remove();
            calculateGPA();
        }
    });

    // Recalculate whenever credit hours or grade change
    creditInput.addEventListener("input", calculateGPA);
    gradeSelect.addEventListener("change", calculateGPA);

    // Assemble the row
    row.appendChild(nameInput);
    row.appendChild(creditInput);
    row.appendChild(gradeSelect);
    row.appendChild(removeBtn);

    return row;
}

// --- Calculate and display GPA ---
function calculateGPA() {
    let totalCredits = 0;
    let totalGradePoints = 0;

    // Loop through every course row
    const rows = courseList.querySelectorAll(".course-row");
    rows.forEach(function (row) {
        const creditInput = row.querySelector(".course-credits");
        const gradeSelect = row.querySelector(".course-grade");

        const credits = parseFloat(creditInput.value);
        const grade   = gradeSelect.value;

        // Validate: credits must be a positive number, grade must be selected
        if (!credits || credits <= 0 || isNaN(credits)) {
            // Mark invalid only if user typed something wrong (not empty)
            creditInput.classList.toggle("invalid", creditInput.value !== "" && (credits <= 0 || isNaN(credits)));
            return; // skip this row
        }

        // Clear invalid styling if valid
        creditInput.classList.remove("invalid");

        if (grade === "" || !(grade in GRADE_SCALE)) {
            return; // skip — no grade selected yet
        }

        // Accumulate totals
        totalCredits += credits;
        totalGradePoints += credits * GRADE_SCALE[grade];
    });

    // Semester GPA
    const semesterGpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0;

    // Update semester results
    totalCreditsEl.textContent = totalCredits;
    totalPointsEl.textContent  = totalGradePoints.toFixed(2);
    semesterGpaEl.textContent  = semesterGpa.toFixed(2);

    // --- Cumulative GPA calculation ---
    const prevGpa     = parseFloat(prevGpaInput.value) || 0;
    const prevCredits = parseFloat(prevCredInput.value) || 0;

    const prevGradePoints = prevGpa * prevCredits;
    const cumCredits      = prevCredits + totalCredits;
    const cumGradePoints  = prevGradePoints + totalGradePoints;
    const cumulGpa        = cumCredits > 0 ? cumGradePoints / cumCredits : 0;

    cumulGpaEl.textContent = cumulGpa.toFixed(2);
}

// --- Add Course button ---
addCourseBtn.addEventListener("click", function () {
    courseList.appendChild(createCourseRow());
});

// --- Reset button ---
resetBtn.addEventListener("click", function () {
    // Clear all course rows and add one fresh row
    courseList.innerHTML = "";
    courseList.appendChild(createCourseRow());

    // Clear previous academic record inputs
    prevGpaInput.value  = "";
    prevCredInput.value = "";

    // Reset results
    calculateGPA();
});

// --- Recalculate when previous GPA/credits change ---
prevGpaInput.addEventListener("input", calculateGPA);
prevCredInput.addEventListener("input", calculateGPA);

// --- Initialize with one empty course row ---
courseList.appendChild(createCourseRow());
