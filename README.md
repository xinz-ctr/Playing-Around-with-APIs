# JobFinder - Remote Job Search Application

The website is live on a secure domain [www.ianchris.tech](https://www.ianchris.tech/)

NOTE: I USED A PUBLIC API THAT DOES NOT REQUIRE AN API_KEY, HENCE WHY THERE IS NO API_KEY IN THIS README

## Project Overview

JobFinder is a responsive web application that allows users to search for remote job opportunities from around the world. The application consumes data from the Remote OK API and provides a clean, user-friendly interface for browsing jobs by keyword. Users can also filter and sort the available positions to quickly find opportunities that match their interests.

The project was built using HTML, CSS and JavaScript without any frontend frameworks.

---

# Features

- Search jobs by keyword
- Search by company name
- Search by technology tags
- Filter by employment type
- Filter by experience level
- Sort jobs by:
  - Newest
  - Company (A-Z)
  - Highest Salary
- Responsive design for desktop, tablet and mobile devices
- Pagination
- Professional user interface
- Direct links to job application pages

---

# Technologies Used

- HTML
- CSS
- JavaScript
- Remote OK API

---

# API Used

## Remote OK API

The application retrieves remote job listings from the Remote OK public API.

API Endpoint

[https://remoteok.com/api](https://remoteok.com/api)

Official Website

[https://remoteok.com](https://remoteok.com)

Documentation

[https://remoteok.com/api](https://remoteok.com/api)

---

# Project Structure

```
Playing-Around-with-APIs/

│

├── index.html

├── style.css

├── script.js

├── README.md

└── .gitignore
```

---

# Running the Project Locally

## Method 1 (Recommended)

Clone the repository

```bash
git clone https://github.com/xinz-ctr/Playing-Around-with-APIs.git
```

Go into the project folder

```bash
cd Playing-Around-with-APIs
```

Open the project using VS Code.

Install the Live Server extension.

Right click **index.html**

Select

```
Open with Live Server
```

The application will automatically open in your browser.

---
## Method 2

If you have Python installed

```bash
python -m http.server
```

or

```bash
python3 -m http.server
```

Open

```
http://localhost:8000
```

---

# Deployment

The application was deployed on Ubuntu web servers running Nginx.

## Step 1

Clone the repository

```bash
git clone https://github.com/xinz-ctr/Playing-Around-with-APIs.git
```

## Step 2

Copy the project files

```bash
sudo cp -r Playing-Around-with-APIs/* /var/www/html/
```

## Step 3

Set permissions

```bash
sudo chown -R www-data:www-data /var/www/html
```

```bash
sudo chmod -R 755 /var/www/html
```

## Step 4

Restart Nginx

```bash
sudo systemctl restart nginx
```

Verify

```bash
sudo systemctl status nginx
```

Visit

```
http://13.222.212.192  for web01
http://44.201.158.84  for web02
```

The application should now be accessible.

---

# Load Balancer Configuration

The application was deployed behind an HAProxy load balancer.

Two web servers were configured as backend servers.

```
Web-01

↓

Web-02

↓

Load Balancer
```

The HAProxy backend configuration pointed to both web servers.

Example

```haproxy
backend web_servers

    balance roundrobin

    server web01 13.222.212.192:80 check

    server web02 44.201.158.84:80 check
```

The **roundrobin** balancing algorithm distributes incoming requests evenly between the two web servers.

Health checks were enabled to ensure that traffic is only sent to healthy servers.

---

# Testing the Load Balancer

The deployment was tested by:

- Accessing the application through the load balancer IP address.
- Refreshing the application multiple times.
- Confirming that requests were distributed between Web-01 and Web-02.
- Verifying that the application continued to function correctly when served through the load balancer.
http://3.87.193.206

The application successfully returned job listings and all search functionality remained operational.

---

# Challenges Encountered

## CORS Issues

Several APIs initially considered for the project blocked requests from browser applications because of Cross-Origin Resource Sharing (CORS) restrictions.

This caused browser requests to fail after deployment.

Solution

A browser-friendly public API was selected and the application was redesigned to work with the available API structure.

---

## API Differences

Different APIs returned different JSON structures.

Solution

The application logic was rewritten to match the Remote OK API response format.

---

## Responsive Design

Creating a layout that worked well on desktop and mobile devices required several iterations.

Solution

CSS Grid, Flexbox and media queries were used to create a responsive layout.

---

# Future Improvements

- Add advanced filtering
- Save favorite jobs
- Dark mode
- Search suggestions
- Bookmark jobs
- Backend caching
- User authentication
- Search history

---

# Credits

## Remote OK

https://remoteok.com

For providing the remote job data.

