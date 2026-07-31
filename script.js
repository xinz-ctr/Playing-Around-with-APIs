const jobTitleInput = document.getElementById("jobTitle");
const searchBtn = document.getElementById("searchBtn");
const clearBtn = document.getElementById("clearBtn");

const employmentTypeSelect = document.getElementById("employmentType");
const senioritySelect = document.getElementById("seniority");
const sortSelect = document.getElementById("sortBy");

const resultsContainer = document.getElementById("results");
const resultCount = document.getElementById("resultCount");
const loading = document.getElementById("loading");

const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");
const pageNumber = document.getElementById("pageNumber");

let jobs = [];
let filteredJobs = [];

let currentPage = 1;
const jobsPerPage = 9;

function showLoading() {

    loading.classList.remove("hidden");

}

function hideLoading() {

    loading.classList.add("hidden");

}

function cleanHTML(text) {

    if (!text) return "";

    const div = document.createElement("div");

    div.innerHTML = text;

    return div.textContent.replace(/\s+/g, " ").trim();

}

function shorten(text, length = 280) {

    if (text.length <= length) {

        return text;

    }

    return text.substring(0, length) + "...";

}

function formatSalary(job) {

    if (
        !job.salary_min ||
        !job.salary_max ||
        job.salary_min === 0 ||
        job.salary_max === 0
    ) {

        return "Salary not specified";

    }

    return `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`;

}

function formatDate(epoch) {

    if (!epoch) {

        return "Recently";

    }

    return new Date(epoch * 1000).toLocaleDateString(undefined, {

        year: "numeric",
        month: "short",
        day: "numeric"

    });

}

async function fetchJobs() {

    showLoading();

    resultsContainer.innerHTML = "";

    try {

        const response = await fetch("https://remoteok.com/api");

        if (!response.ok) {

            throw new Error("Unable to fetch jobs.");

        }

        const data = await response.json();

        jobs = data.filter(job => job.position);

        filteredJobs = [...jobs];

        resultCount.textContent = `${jobs.length} Remote Jobs Found`;

        displayJobs();

    }

    catch (error) {

        resultsContainer.innerHTML = `

            <div class="message">

                <i class="fa-solid fa-circle-exclamation"></i>

                <h2>Unable to load jobs</h2>

                <p>Please try again later.</p>

            </div>

        `;

    }

    hideLoading();

}

function searchJobs() {

    const keyword = jobTitleInput.value
        .trim()
        .toLowerCase();

    filteredJobs = jobs.filter(job => {

        const title = (job.position || "").toLowerCase();

        const company = (job.company || "").toLowerCase();

        const tags = (job.tags || []).join(" ").toLowerCase();

        return (

            keyword === "" ||

            title.includes(keyword) ||

            company.includes(keyword) ||

            tags.includes(keyword)

        );

    });

    currentPage = 1;

    applyFilters();

}
function applyFilters() {

    let results = [...filteredJobs];

    const employment = employmentTypeSelect.value.toLowerCase();

    const seniority = senioritySelect.value.toLowerCase();

    if (employment !== "") {

        results = results.filter(job => {

            const tags = (job.tags || []).join(" ").toLowerCase();

            return tags.includes(employment);

        });

    }

    if (seniority !== "") {

        results = results.filter(job => {

            const tags = (job.tags || []).join(" ").toLowerCase();

            return tags.includes(seniority);

        });

    }

    switch (sortSelect.value) {

        case "company":

            results.sort((a, b) =>
                (a.company || "").localeCompare(b.company || "")
            );

            break;

        case "salary_high":

            results.sort((a, b) =>
                (b.salary_max || 0) - (a.salary_max || 0)
            );

            break;

        default:

            results.sort((a, b) =>
                (b.epoch || 0) - (a.epoch || 0)
            );

    }

    filteredJobs = results;

    displayJobs();

}

function displayJobs() {

    resultsContainer.innerHTML = "";

    resultCount.textContent = `${filteredJobs.length} Remote Jobs Found`;

    if (filteredJobs.length === 0) {

        resultsContainer.innerHTML = `

            <div class="message">

                <i class="fa-solid fa-magnifying-glass"></i>

                <h2>No jobs found</h2>

                <p>Try another search or remove some filters.</p>

            </div>

        `;

        pageNumber.textContent = "Page 1";

        prevPageBtn.disabled = true;

        nextPageBtn.disabled = true;

        return;

    }

    const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

    const start = (currentPage - 1) * jobsPerPage;

    const end = start + jobsPerPage;

    const pageJobs = filteredJobs.slice(start, end);

    pageJobs.forEach(job => {

        const tags = (job.tags || [])
            .slice(0, 5)
            .map(tag => `<span>${tag}</span>`)
            .join("");

        const card = document.createElement("article");

        card.className = "job-card";

        card.innerHTML = `

            <div class="job-header">

                <h2>${job.position || "Untitled Position"}</h2>

                <div class="company">

                    ${job.company || "Unknown Company"}

                </div>

            </div>

            <div class="job-info">

                <p>

                    <i class="fa-solid fa-location-dot"></i>

                    ${job.location || "Worldwide"}

                </p>

                <p>

                    <i class="fa-solid fa-money-bill-wave"></i>

                    ${formatSalary(job)}

                </p>

                <p>

                    <i class="fa-regular fa-calendar"></i>

                    ${formatDate(job.epoch)}

                </p>

            </div>

            <div class="tags">

                ${tags}

            </div>

            <div class="job-description">

                ${shorten(cleanHTML(job.description))}

            </div>

            <div class="job-footer">

                <span class="posted-date">

                    Posted ${formatDate(job.epoch)}

                </span>

                <a
                    class="view-job"
                    href="${job.apply_url || job.url}"
                    target="_blank"
                    rel="noopener noreferrer"
                >

                    View Job

                    <i class="fa-solid fa-arrow-up-right-from-square"></i>

                </a>

            </div>

        `;

        resultsContainer.appendChild(card);

    });

    pageNumber.textContent = `Page ${currentPage} of ${totalPages}`;

    prevPageBtn.disabled = currentPage === 1;

    nextPageBtn.disabled = currentPage === totalPages;

}
searchBtn.addEventListener("click", () => {

    searchJobs();

});

jobTitleInput.addEventListener("keydown", event => {

    if (event.key === "Enter") {

        searchJobs();

    }

});

employmentTypeSelect.addEventListener("change", () => {

    currentPage = 1;

    applyFilters();

});

senioritySelect.addEventListener("change", () => {

    currentPage = 1;

    applyFilters();

});

sortSelect.addEventListener("change", () => {

    currentPage = 1;

    applyFilters();

});

clearBtn.addEventListener("click", () => {

    jobTitleInput.value = "";

    employmentTypeSelect.value = "";

    senioritySelect.value = "";

    sortSelect.value = "newest";

    filteredJobs = [...jobs];

    currentPage = 1;

    displayJobs();

});

prevPageBtn.addEventListener("click", () => {

    if (currentPage === 1) {

        return;

    }

    currentPage--;

    displayJobs();

    window.scrollTo({

        top: document.querySelector(".status").offsetTop - 20,

        behavior: "smooth"

    });

});

nextPageBtn.addEventListener("click", () => {

    const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

    if (currentPage >= totalPages) {

        return;

    }

    currentPage++;

    displayJobs();

    window.scrollTo({

        top: document.querySelector(".status").offsetTop - 20,

        behavior: "smooth"

    });

});

window.addEventListener("load", () => {

    fetchJobs();

});