// =====================================================
// JOBFINDER - HIMALAYAS API
// Part 1 - Variables, API Request & Job Display
// =====================================================

// ------------------------------
// HTML ELEMENTS
// ------------------------------

const jobTitleInput = document.getElementById("jobTitle");
const countryInput = document.getElementById("country");

const searchBtn = document.getElementById("searchBtn");
const clearBtn = document.getElementById("clearBtn");

const resultsContainer = document.getElementById("results");
const loading = document.getElementById("loading");
const resultCount = document.getElementById("resultCount");

const employmentTypeSelect = document.getElementById("employmentType");
const senioritySelect = document.getElementById("seniority");
const sortSelect = document.getElementById("sortBy");

const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");
const pageNumber = document.getElementById("pageNumber");

// ------------------------------
// GLOBAL VARIABLES
// ------------------------------

let jobs = [];
let currentPage = 1;
let totalJobs = 0;

// ------------------------------
// REMOVE HTML TAGS
// ------------------------------

function stripHTML(html) {

    if (!html) return "";

    const temp = document.createElement("div");

    temp.innerHTML = html;

    return temp.textContent || temp.innerText || "";

}

// ------------------------------
// FORMAT SALARY
// ------------------------------

function formatSalary(job) {

    if (!job.minSalary || !job.maxSalary) {

        return "Not specified";

    }

    return `${job.currency} ${job.minSalary.toLocaleString()} - ${job.maxSalary.toLocaleString()} / ${job.salaryPeriod}`;

}

// ------------------------------
// FETCH JOBS FROM API
// ------------------------------

async function fetchJobs() {

    const keyword = jobTitleInput.value.trim();
    const country = countryInput.value.trim();

    if (keyword === "") {

        alert("Please enter a job title.");

        return;

    }

    loading.classList.remove("hidden");

    resultsContainer.innerHTML = "";

    resultCount.textContent = "";

    try {

        let url =
            `https://himalayas.app/jobs/api/search?q=${encodeURIComponent(keyword)}&page=${currentPage}`;

        if (country !== "") {

            url += `&country=${encodeURIComponent(country)}`;

        }

        const response = await fetch(url);

        if (!response.ok) {

            throw new Error("Unable to fetch jobs.");

        }

        const data = await response.json();

        jobs = data.jobs || [];

        totalJobs = data.totalCount || jobs.length;

        displayJobs(jobs);

    }

    catch (error) {

        console.error(error);

        resultsContainer.innerHTML = `

        <div class="message">

            <h2>Failed to fetch jobs.</h2>

            <p>Please try another search.</p>

        </div>

        `;

    }

    finally {

        loading.classList.add("hidden");

    }

}

// ------------------------------
// DISPLAY JOBS
// ------------------------------

function displayJobs(jobList) {

    resultsContainer.innerHTML = "";

    resultCount.textContent =
        `${jobList.length} jobs found`;

    pageNumber.textContent =
        `Page ${currentPage}`;

    if (jobList.length === 0) {

        resultsContainer.innerHTML = `

        <div class="message">

            <h2>No jobs found.</h2>

        </div>

        `;

        return;

    }

    jobList.forEach(job => {

        const logo =
            job.companyLogo ||
            "https://via.placeholder.com/70";

        const company =
            job.companyName || "Unknown Company";

        const title =
            job.title || "Untitled";

        const location =
            job.locationRestrictions
                ? job.locationRestrictions.join(", ")
                : "Worldwide";

        const seniority =
            job.seniority
                ? job.seniority.join(", ")
                : "Not specified";

        const employment =
            job.employmentType || "Not specified";

        const salary =
            formatSalary(job);

        const description =
            job.excerpt
                ? job.excerpt
                : stripHTML(job.description).substring(0,220) + "...";

        const category =
            job.categories
                ? job.categories[0]
                : "General";

        const jobURL =
            `https://himalayas.app/companies/${job.companySlug}/jobs`;

        const card = document.createElement("div");

        card.className = "job-card";

        card.innerHTML = `

        <div class="job-header">

            <img src="${logo}" alt="Company Logo">

            <div>

                <h3>${title}</h3>

                <p class="company">${company}</p>

            </div>

        </div>

        <div class="job-info">

            <p><strong>Location:</strong> ${location}</p>

            <p><strong>Employment:</strong> ${employment}</p>

            <p><strong>Experience:</strong> ${seniority}</p>

            <p><strong>Salary:</strong> ${salary}</p>

        </div>

        <p class="job-description">

            ${description}

        </p>

        <div class="job-footer">

            <span>${category}</span>

            <a href="${jobURL}" target="_blank">

                View Job

            </a>

        </div>

        `;

        resultsContainer.appendChild(card);

    });

}
// =====================================================
// JOBFINDER - HIMALAYAS API
// Part 2 - Filters, Sorting, Pagination & Events
// =====================================================


// -----------------------------------------------------
// APPLY FILTERS
// -----------------------------------------------------

function applyFilters() {

    let filteredJobs = [...jobs];

    // Employment Type

    if (employmentTypeSelect.value !== "") {

        filteredJobs = filteredJobs.filter(job => {

            return (job.employmentType || "")
                .toLowerCase()
                .includes(employmentTypeSelect.value.toLowerCase());

        });

    }

    // Seniority

    if (senioritySelect.value !== "") {

        filteredJobs = filteredJobs.filter(job => {

            const level = (job.seniority || []).join(" ");

            return level
                .toLowerCase()
                .includes(senioritySelect.value.toLowerCase());

        });

    }

    sortJobs(filteredJobs);

}



// -----------------------------------------------------
// SORT JOBS
// -----------------------------------------------------

function sortJobs(jobList) {

    const sortValue = sortSelect.value;

    switch (sortValue) {

        case "company":

            jobList.sort((a, b) =>

                (a.companyName || "")
                    .localeCompare(b.companyName || "")

            );

            break;

        case "salary_high":

            jobList.sort((a, b) =>

                (b.maxSalary || 0) -
                (a.maxSalary || 0)

            );

            break;

        case "salary_low":

            jobList.sort((a, b) =>

                (a.minSalary || 0) -
                (b.minSalary || 0)

            );

            break;

        case "recent":

            // API already returns newest first
            break;

        default:
            break;

    }

    displayJobs(jobList);

}



// -----------------------------------------------------
// CLEAR RESULTS
// -----------------------------------------------------

function clearResults() {

    jobTitleInput.value = "";
    countryInput.value = "";

    employmentTypeSelect.value = "";
    senioritySelect.value = "";

    sortSelect.value = "relevance";

    jobs = [];

    currentPage = 1;

    resultsContainer.innerHTML = "";

    resultCount.textContent = "";

    pageNumber.textContent = "Page 1";

}



// -----------------------------------------------------
// NEXT PAGE
// -----------------------------------------------------

nextPageBtn.addEventListener("click", () => {

    currentPage++;

    fetchJobs();

});



// -----------------------------------------------------
// PREVIOUS PAGE
// -----------------------------------------------------

prevPageBtn.addEventListener("click", () => {

    if (currentPage > 1) {

        currentPage--;

        fetchJobs();

    }

});



// -----------------------------------------------------
// SEARCH BUTTON
// -----------------------------------------------------

searchBtn.addEventListener("click", () => {

    currentPage = 1;

    fetchJobs();

});



// -----------------------------------------------------
// CLEAR BUTTON
// -----------------------------------------------------

clearBtn.addEventListener("click", clearResults);



// -----------------------------------------------------
// FILTER EVENTS
// -----------------------------------------------------

employmentTypeSelect.addEventListener("change", applyFilters);

senioritySelect.addEventListener("change", applyFilters);

sortSelect.addEventListener("change", applyFilters);



// -----------------------------------------------------
// ENTER KEY SEARCH
// -----------------------------------------------------

jobTitleInput.addEventListener("keydown", function (e) {

    if (e.key === "Enter") {

        currentPage = 1;

        fetchJobs();

    }

});



countryInput.addEventListener("keydown", function (e) {

    if (e.key === "Enter") {

        currentPage = 1;

        fetchJobs();

    }

});



// -----------------------------------------------------
// INITIAL MESSAGE
// -----------------------------------------------------

resultsContainer.innerHTML = `

<div class="message">

    <h2>Welcome to JobFinder</h2>

    <p>

        Search for jobs by entering a job title and
        optionally a country.

    </p>

</div>

`;
// =====================================================
// JOBFINDER - HIMALAYAS API
// Part 3 - Utilities & Final Enhancements
// =====================================================


// -----------------------------------------------------
// UPDATE PAGINATION BUTTONS
// -----------------------------------------------------

function updatePaginationButtons() {

    prevPageBtn.disabled = currentPage === 1;

    nextPageBtn.disabled = jobs.length === 0;

}



// -----------------------------------------------------
// LOADING HELPERS
// -----------------------------------------------------

function showLoading() {

    loading.classList.remove("hidden");

    searchBtn.disabled = true;

}



function hideLoading() {

    loading.classList.add("hidden");

    searchBtn.disabled = false;

}



// -----------------------------------------------------
// IMAGE FALLBACK
// -----------------------------------------------------

document.addEventListener("error", function (event) {

    if (event.target.tagName === "IMG") {

        event.target.src =
            "https://via.placeholder.com/70?text=Logo";

    }

}, true);



// -----------------------------------------------------
// REFRESH RESULTS WHEN FILTERS CHANGE
// -----------------------------------------------------

employmentTypeSelect.addEventListener("change", function () {

    applyFilters();

    updatePaginationButtons();

});



senioritySelect.addEventListener("change", function () {

    applyFilters();

    updatePaginationButtons();

});



sortSelect.addEventListener("change", function () {

    applyFilters();

    updatePaginationButtons();

});



// -----------------------------------------------------
// UPDATE PAGE AFTER FETCHING
// -----------------------------------------------------

const originalFetchJobs = fetchJobs;

fetchJobs = async function () {

    showLoading();

    await originalFetchJobs();

    hideLoading();

    updatePaginationButtons();

};



// -----------------------------------------------------
// RESET PAGINATION AFTER CLEAR
// -----------------------------------------------------

const originalClearResults = clearResults;

clearResults = function () {

    originalClearResults();

    updatePaginationButtons();

};



// -----------------------------------------------------
// SHOW WELCOME MESSAGE ON LOAD
// -----------------------------------------------------

window.addEventListener("DOMContentLoaded", () => {

    resultsContainer.innerHTML = `

    <div class="message">

        <h2>Welcome to JobFinder</h2>

        <p>

            Search thousands of remote jobs using the
            Himalayas Jobs API.

        </p>

        <br>

        <p>

            Enter a job title and optionally a country,
            then click <strong>Search</strong>.

        </p>

    </div>

    `;

    updatePaginationButtons();

});



// -----------------------------------------------------
// FOOTER CONSOLE MESSAGE
// -----------------------------------------------------

console.log(
    "JobFinder loaded successfully."
);