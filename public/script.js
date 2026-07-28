// ================================
// Get HTML Elements
// ================================

const searchBtn = document.getElementById("searchBtn");
const jobTitleInput = document.getElementById("jobTitle");
const locationInput = document.getElementById("location");
const resultCount = document.getElementById("resultCount");
const clearBtn = document.getElementById("clearBtn");

const resultsContainer = document.getElementById("results");
const loading = document.getElementById("loading");

const remoteFilter = document.getElementById("remoteFilter");
const fullTimeFilter = document.getElementById("fullTimeFilter");
const internshipFilter = document.getElementById("internshipFilter");
const sortSelect = document.getElementById("sortSelect");

// Store all jobs
let jobs = [];

// ================================
// Event Listeners
// ================================

searchBtn.addEventListener("click", fetchJobs);
clearBtn.addEventListener("click", clearResults);

remoteFilter.addEventListener("change", displayJobs);
fullTimeFilter.addEventListener("change", displayJobs);
internshipFilter.addEventListener("change", displayJobs);
sortSelect.addEventListener("change", displayJobs);

jobTitleInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        fetchJobs();
    }
});

locationInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        fetchJobs();
    }
});

// ================================
// Fetch Jobs From API
// ================================

async function fetchJobs() {

    const title = jobTitleInput.value.trim();
    const location = locationInput.value.trim();

    if (title === "") {
        alert("Please enter a job title.");
        return;
    }

    loading.classList.remove("hidden");
    resultsContainer.innerHTML = "";

    try {
        const response = await fetch(
            `/api/jobs?q=${encodeURIComponent(title)}&location=${encodeURIComponent(location)}`
        );

        if (!response.ok) {
            throw new Error("Failed to fetch jobs.");
        }

        const data = await response.json();

        jobs = data.jobs_results || [];

        displayJobs();

    } catch (error) {

        resultsContainer.innerHTML = `
            <div class="message">
                ${error.message}
            </div>
        `;

    } finally {

        loading.classList.add("hidden");

    }
}

// ================================
// Display Jobs
// ================================

function displayJobs() {

    let filteredJobs = [...jobs];

    // Remote Filter
    if (remoteFilter.checked) {
        filteredJobs = filteredJobs.filter(job =>
            (job.location || "").toLowerCase().includes("remote")
        );
    }

    // Full-Time Filter
    if (fullTimeFilter.checked) {
        filteredJobs = filteredJobs.filter(job =>
            (job.detected_extensions?.schedule_type || "")
                .toLowerCase()
                .includes("full")
        );
    }

    // Internship Filter
    if (internshipFilter.checked) {
        filteredJobs = filteredJobs.filter(job =>
            (job.detected_extensions?.schedule_type || "")
                .toLowerCase()
                .includes("intern")
        );
    }

    // Sorting
    switch (sortSelect.value) {

        case "company":
            filteredJobs.sort((a, b) =>
                (a.company_name || "").localeCompare(b.company_name || "")
            );
            break;

        case "title":
            filteredJobs.sort((a, b) =>
                (a.title || "").localeCompare(b.title || "")
            );
            break;

        case "newest":
        default:
            break;
    }

    // Clear previous results
    resultsContainer.innerHTML = "";

    // No jobs found
    if (filteredJobs.length === 0) {
        resultsContainer.innerHTML = `
            <div class="message">
                No jobs found.
            </div>
        `;
        return;
    }
    resultCount.textContent =
    `Showing ${filteredJobs.length} job opportunit${filteredJobs.length === 1 ? "y" : "ies"}.`;

    // Display each job
    filteredJobs.forEach(function (job) {

        const salary = job.detected_extensions?.salary || "Not specified";
        const schedule = job.detected_extensions?.schedule_type || "Not specified";
        const posted = job.detected_extensions?.posted_at || "Recently";

        const description = job.description || "No description available.";

        const card = document.createElement("div");
        card.className = "job-card";

        card.innerHTML = `
            <h2>${job.title || "Unknown Job"}</h2>

            <p class="company">
                <strong>Company:</strong> ${job.company_name || "Unknown Company"}
            </p>

            <p>
                <strong>Location:</strong> ${job.location || "Unknown Location"}
            </p>

            <p class="type">
                <strong>Job Type:</strong> ${schedule}
            </p>

            <p class="salary">
                <strong>Salary:</strong> ${salary}
            </p>

            <p class="posted">
                <strong>Posted:</strong> ${posted}
            </p>

            <p>
                <strong>Description:</strong><br>
                ${description}
            </p>
        `;

        resultsContainer.appendChild(card);

    });

}
function clearResults(){

    jobs = [];

    resultsContainer.innerHTML = "";

    resultCount.textContent = "";

    jobTitleInput.value = "";

    locationInput.value = "";

    remoteFilter.checked = false;
    fullTimeFilter.checked = false;
    internshipFilter.checked = false;

    sortSelect.value = "newest";

}