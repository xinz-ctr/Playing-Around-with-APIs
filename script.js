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

function stripHTML(html) {

    if (!html) return "";

    const temp = document.createElement("div");

    temp.innerHTML = html;

    return temp.textContent || temp.innerText || "";

}

function formatSalary(job) {

    if (
        !job.salary_min ||
        !job.salary_max ||
        job.salary_min === 0 ||
        job.salary_max === 0
    ) {

        return "Salary Not Specified";

    }

    return "$" +
        job.salary_min.toLocaleString() +
        " - $" +
        job.salary_max.toLocaleString();

}

function formatDate(epoch) {

    if (!epoch) return "Recently Posted";

    const date = new Date(epoch * 1000);

    return date.toLocaleDateString();

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

        jobs = data.filter(job => job.id);

        searchJobs();

    }

    catch (error) {

        console.error(error);

        resultsContainer.innerHTML =

        `
        <div class="message">

            <h2>Unable to load jobs.</h2>

            <p>Please try again later.</p>

        </div>
        `;

    }

    finally {

        hideLoading();

    }

}

function searchJobs() {

    const keyword =
        jobTitleInput.value.trim().toLowerCase();

    const location =
        countryInput.value.trim().toLowerCase();

    filteredJobs = jobs.filter(job => {

        const title =
            (job.position || "").toLowerCase();

        const company =
            (job.company || "").toLowerCase();

        const country =
            (job.location || "").toLowerCase();

        const keywordMatch =

            keyword === "" ||

            title.includes(keyword) ||

            company.includes(keyword);

        const locationMatch =

            location === "" ||

            country.includes(location);

        return keywordMatch && locationMatch;

    });

    currentPage = 1;

    applyFilters();

}
function applyFilters() {

    let results = [...filteredJobs];

    const employment =
        employmentTypeSelect.value.toLowerCase();

    const seniority =
        senioritySelect.value.toLowerCase();

    if (employment !== "") {

        results = results.filter(job => {

            if (!job.tags) return false;

            return job.tags.some(tag =>
                tag.toLowerCase().includes(employment)
            );

        });

    }

    if (seniority !== "") {

        results = results.filter(job => {

            if (!job.tags) return false;

            return job.tags.some(tag =>
                tag.toLowerCase().includes(seniority)
            );

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

        case "salary_low":

            results.sort((a, b) =>
                (a.salary_min || 0) - (b.salary_min || 0)
            );

            break;

    }

    filteredJobs = results;

    displayJobs();

}

function displayJobs() {

    resultsContainer.innerHTML = "";

    resultCount.textContent =
        `${filteredJobs.length} Jobs Found`;

    if (filteredJobs.length === 0) {

        resultsContainer.innerHTML =

        `
        <div class="message">

            <h2>No jobs found</h2>

            <p>Try a different search.</p>

        </div>
        `;

        pageNumber.textContent = "Page 1";

        return;

    }

    const start =
        (currentPage - 1) * jobsPerPage;

    const end =
        start + jobsPerPage;

    const pageJobs =
        filteredJobs.slice(start, end);

    pageJobs.forEach(job => {

        const logo =

            job.company_logo && job.company_logo !== ""

            ? job.company_logo

            : "https://via.placeholder.com/70?text=Logo";

        const tags =

            job.tags && job.tags.length

            ? job.tags.slice(0,5)

            : [];

        const description =

            stripHTML(job.description)

            .replace(/\s+/g," ")

            .trim()

            .substring(0,220) + "...";

        const card = document.createElement("div");

        card.className = "job-card";

        card.innerHTML =

        `
        <div class="job-header">

            <img src="${logo}" alt="${job.company}">

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

                ${formatSalary(job)}

            </p>

            <p>

                <strong>Posted:</strong>

                ${formatDate(job.epoch)}

            </p>

        </div>

        <div class="job-tags">

            ${tags.map(tag => `<span>${tag}</span>`).join("")}

        </div>

        <p class="job-description">

            ${description}

        </p>

        <div class="job-footer">

            <span>

                ${job.company}

            </span>

            <a
                href="${job.apply_url}"
                target="_blank"
            >

                View Job

            </a>

        </div>
        `;

        resultsContainer.appendChild(card);

    });

    const totalPages =
        Math.ceil(filteredJobs.length / jobsPerPage);

    pageNumber.textContent =
        `Page ${currentPage} of ${totalPages}`;

    prevPageBtn.disabled =
        currentPage === 1;

    nextPageBtn.disabled =
        currentPage === totalPages;

}
searchBtn.addEventListener("click", () => {

    searchJobs();

});

clearBtn.addEventListener("click", () => {

    jobTitleInput.value = "";

    countryInput.value = "";

    employmentTypeSelect.value = "";

    senioritySelect.value = "";

    sortSelect.value = "";

    filteredJobs = [...jobs];

    currentPage = 1;

    displayJobs();

});

jobTitleInput.addEventListener("keypress", e => {

    if (e.key === "Enter") {

        searchJobs();

    }

});

countryInput.addEventListener("keypress", e => {

    if (e.key === "Enter") {

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

nextPageBtn.addEventListener("click", () => {

    const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

    if (currentPage < totalPages) {

        currentPage++;

        displayJobs();

        window.scrollTo({

            top: 250,

            behavior: "smooth"

        });

    }

});

prevPageBtn.addEventListener("click", () => {

    if (currentPage > 1) {

        currentPage--;

        displayJobs();

        window.scrollTo({

            top: 250,

            behavior: "smooth"

        });

    }

});

window.addEventListener("load", () => {

    fetchJobs();

});

window.addEventListener("pageshow", () => {

    if (jobs.length === 0) {

        fetchJobs();

    }

});