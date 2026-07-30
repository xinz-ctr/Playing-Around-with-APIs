// ======================================================
// JOBFINDER - Remote OK API
// Part 1 - Variables, Fetch API & Display Jobs
// ======================================================


// -----------------------------
// HTML ELEMENTS
// -----------------------------

const jobTitleInput = document.getElementById("jobTitle");
const countryInput = document.getElementById("country");

const searchBtn = document.getElementById("searchBtn");
const clearBtn = document.getElementById("clearBtn");

const employmentTypeSelect = document.getElementById("employmentType");
const senioritySelect = document.getElementById("seniority");
const sortSelect = document.getElementById("sortBy");

const resultsContainer = document.getElementById("results");
const loading = document.getElementById("loading");
const resultCount = document.getElementById("resultCount");

const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");
const pageNumber = document.getElementById("pageNumber");


// -----------------------------
// GLOBAL VARIABLES
// -----------------------------

let allJobs = [];
let filteredJobs = [];

let currentPage = 1;
const jobsPerPage = 10;


// -----------------------------
// FETCH JOBS
// -----------------------------

async function fetchJobs() {

    loading.classList.remove("hidden");

    try {

        const response = await fetch("https://remoteok.com/api");

        if (!response.ok) {

            throw new Error("Unable to fetch jobs.");

        }

        const data = await response.json();

        // Remove first metadata object
        allJobs = data.slice(1);

        searchJobs();

    }

    catch (error) {

        console.error(error);

        resultsContainer.innerHTML = `

            <div class="message">

                <h2>Failed to fetch jobs.</h2>

                <p>Please try again later.</p>

            </div>

        `;

    }

    finally {

        loading.classList.add("hidden");

    }

}


// -----------------------------
// SEARCH JOBS
// -----------------------------

function searchJobs() {

    const keyword = jobTitleInput.value.trim().toLowerCase();

    const country = countryInput.value.trim().toLowerCase();

    filteredJobs = allJobs.filter(job => {

        const title =
            (job.position || "").toLowerCase();

        const company =
            (job.company || "").toLowerCase();

        const location =
            (job.location || "").toLowerCase();

        const matchesKeyword =
            keyword === "" ||
            title.includes(keyword) ||
            company.includes(keyword);

        const matchesCountry =
            country === "" ||
            location.includes(country);

        return matchesKeyword && matchesCountry;

    });

    displayJobs();

}



// -----------------------------
// DISPLAY JOBS
// -----------------------------

function displayJobs() {

    resultsContainer.innerHTML = "";

    resultCount.textContent =
        `${filteredJobs.length} Jobs Found`;

    if (filteredJobs.length === 0) {

        resultsContainer.innerHTML = `

            <div class="message">

                <h2>No jobs found.</h2>

            </div>

        `;

        return;

    }

    const start =
        (currentPage - 1) * jobsPerPage;

    const end =
        start + jobsPerPage;

    const jobs =
        filteredJobs.slice(start, end);

    jobs.forEach(job => {

        const logo =
            job.logo ||
            "https://via.placeholder.com/80";

        const salary =

            job.salary_min && job.salary_max

            ?

            `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`

            :

            "Not specified";

        const tags =

            job.tags

            ?

            job.tags.join(", ")

            :

            "General";

        const description =

            job.description

            ?

            job.description
                .replace(/<[^>]*>/g, "")
                .substring(0,220) + "..."

            :

            "No description available.";

        const card = document.createElement("div");

        card.className = "job-card";

        card.innerHTML = `

            <div class="job-header">

                <img
                    src="${logo}"
                    alt="Company Logo">

                <div>

                    <h3>${job.position}</h3>

                    <p class="company">

                        ${job.company}

                    </p>

                </div>

            </div>

            <div class="job-info">

                <p>

                    <strong>Location:</strong>

                    ${job.location || "Worldwide"}

                </p>

                <p>

                    <strong>Salary:</strong>

                    ${salary}

                </p>

                <p>

                    <strong>Tags:</strong>

                    ${tags}

                </p>

            </div>

            <p class="job-description">

                ${description}

            </p>

            <div class="job-footer">

                <a
                    href="${job.url}"
                    target="_blank">

                    View Job

                </a>

            </div>

        `;

        resultsContainer.appendChild(card);

    });

    pageNumber.textContent =
        `Page ${currentPage}`;

}
// ======================================================
// JOBFINDER - Remote OK API
// Part 2 - Sorting, Filters, Pagination & Events
// ======================================================


// -----------------------------
// APPLY FILTERS
// -----------------------------

function applyFilters() {

    let jobs = [...filteredJobs];

    // Employment Type Filter

    if (employmentTypeSelect.value !== "") {

        jobs = jobs.filter(job => {

            if (!job.tags) return false;

            return job.tags.some(tag =>
                tag.toLowerCase().includes(
                    employmentTypeSelect.value.toLowerCase()
                )
            );

        });

    }

    // Seniority Filter

    if (senioritySelect.value !== "") {

        jobs = jobs.filter(job => {

            if (!job.tags) return false;

            return job.tags.some(tag =>
                tag.toLowerCase().includes(
                    senioritySelect.value.toLowerCase()
                )
            );

        });

    }

    sortJobs(jobs);

}



// -----------------------------
// SORT JOBS
// -----------------------------

function sortJobs(jobList) {

    switch (sortSelect.value) {

        case "company":

            jobList.sort((a, b) =>
                (a.company || "")
                .localeCompare(b.company || "")
            );

            break;

        case "salary_high":

            jobList.sort((a, b) =>
                (b.salary_max || 0) -
                (a.salary_max || 0)
            );

            break;

        case "salary_low":

            jobList.sort((a, b) =>
                (a.salary_min || 0) -
                (b.salary_min || 0)
            );

            break;

        default:
            break;

    }

    filteredJobs = jobList;

    currentPage = 1;

    displayJobs();

}



// -----------------------------
// SEARCH BUTTON
// -----------------------------

searchBtn.addEventListener("click", () => {

    currentPage = 1;

    searchJobs();

});



// -----------------------------
// CLEAR BUTTON
// -----------------------------

clearBtn.addEventListener("click", () => {

    jobTitleInput.value = "";

    countryInput.value = "";

    employmentTypeSelect.value = "";

    senioritySelect.value = "";

    sortSelect.value = "";

    filteredJobs = [...allJobs];

    currentPage = 1;

    displayJobs();

});



// -----------------------------
// FILTER EVENTS
// -----------------------------

employmentTypeSelect.addEventListener("change", applyFilters);

senioritySelect.addEventListener("change", applyFilters);

sortSelect.addEventListener("change", applyFilters);



// -----------------------------
// ENTER KEY SUPPORT
// -----------------------------

jobTitleInput.addEventListener("keydown", e => {

    if (e.key === "Enter") {

        currentPage = 1;

        searchJobs();

    }

});



countryInput.addEventListener("keydown", e => {

    if (e.key === "Enter") {

        currentPage = 1;

        searchJobs();

    }

});



// -----------------------------
// PAGINATION
// -----------------------------

nextPageBtn.addEventListener("click", () => {

    const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

    if (currentPage < totalPages) {

        currentPage++;

        displayJobs();

    }

});



prevPageBtn.addEventListener("click", () => {

    if (currentPage > 1) {

        currentPage--;

        displayJobs();

    }

});



// -----------------------------
// INITIAL MESSAGE
// -----------------------------

window.addEventListener("DOMContentLoaded", () => {

    resultsContainer.innerHTML = `

        <div class="message">

            <h2>Welcome to JobFinder</h2>

            <p>

                Search thousands of remote jobs using the
                Remote OK API.

            </p>

            <br>

            <p>

                Enter a job title to begin.

            </p>

        </div>

    `;

    fetchJobs();

});