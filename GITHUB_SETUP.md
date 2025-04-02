# GitHub Repository Setup Guide

This guide will help you create a GitHub repository for the FTP M3U Generator project and upload the code to it.

## Creating a GitHub Repository

1. **Sign in to GitHub** or create an account if you don't have one already.

2. **Create a new repository**:
   - Click the '+' button in the top-right corner of GitHub and select "New repository"
   - Name your repository (e.g., "ftp-m3u-generator")
   - Add a description (optional): "An Android application for browsing FTP servers and generating M3U playlists"
   - Choose "Public" or "Private" visibility
   - Do not initialize the repository with a README, .gitignore, or license (we'll upload our own)
   - Click "Create repository"

## Uploading This Project to GitHub

### Method 1: Using Git Command Line

1. **Download this project** from Replit.
   - Click on the three dots menu at the top-right corner of the Replit interface
   - Select "Download as zip"
   - Extract the zip file to a folder on your computer

2. **Initialize Git repository and push to GitHub**:
   ```bash
   # Navigate to the project folder
   cd path/to/extracted/project
   
   # Initialize git repository
   git init
   
   # Add all files
   git add .
   
   # Commit the files
   git commit -m "Initial commit"
   
   # Add your GitHub repository as remote
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   
   # Push to GitHub
   git push -u origin main
   ```

### Method 2: Using GitHub Desktop

1. **Download GitHub Desktop** from https://desktop.github.com/ and install it.

2. **Download this project** from Replit.
   - Click on the three dots menu at the top-right corner of the Replit interface
   - Select "Download as zip"
   - Extract the zip file to a folder on your computer

3. **Add the project to GitHub Desktop**:
   - Open GitHub Desktop
   - Choose "File > Add local repository"
   - Select the folder where you extracted the project
   - If it's not already a Git repository, you'll be prompted to create one
   - Fill in the repository details and click "Create repository"
   - Click "Publish repository" to push to GitHub

### Method 3: Using GitHub Web Interface (for small projects)

1. In your new GitHub repository, click the "uploading an existing file" link.

2. **Drag and drop** the files from the extracted project folder to the upload area.
   - Note: GitHub web interface has file size and number limitations. For large projects, use Method 1 or 2.

3. Add a commit message and click "Commit changes".

## After Uploading

Once you've uploaded the project to GitHub:

1. **Verify** that all files appear correctly in your repository.

2. **Update the repository settings** if needed:
   - Go to "Settings" tab in your repository
   - Add topics to make your repository more discoverable
   - Configure GitHub Pages if you want to showcase the project on a website

3. **Share the repository URL** with others who need access to the code.

## Building the Android APK from the GitHub Repository

1. Clone your GitHub repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   ```

2. Follow the instructions in the ANDROID_BUILD_GUIDE.md file to build the APK.

## Need Help?

If you encounter any issues during this process, refer to GitHub's documentation:
- [GitHub Docs](https://docs.github.com/en)
- [Creating a repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository)
- [Adding a file to a repository](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository)