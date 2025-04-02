import os
import re
import requests
import json
from urllib.parse import urljoin, unquote
from bs4 import BeautifulSoup
import tkinter as tk
from tkinter import filedialog, ttk, messagebox, simpledialog
from collections import defaultdict
import threading
from datetime import datetime

def get_folders_recursive(base_url, search_term):
    """Recursively scrape FTP directory for folders that might contain the search term."""
    # Always include the base URL as a folder to check
    folders = [base_url]
    checked_folders = set()  # Keep track of folders we've already checked
    
    try:
        # Get the base page content
        response = requests.get(base_url, timeout=5)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, "html.parser")
            
            # Convert search term to lowercase for case-insensitive matching
            # Split into words for better matching
            search_words = search_term.lower().split()
            
            # First, check if this is a movie directory
            is_movie_dir = "movie" in base_url.lower()
            
            # Look for direct subfolders that might match the search term
            for link in soup.find_all("a"):
                href = link.get("href")
                if href and href.endswith("/") and href != "../" and href != "/":
                    full_url = urljoin(base_url, href)
                    
                    # Skip if we've already checked this URL
                    if full_url in checked_folders:
                        continue
                    checked_folders.add(full_url)
                    
                    # Special handling for movie directories
                    if is_movie_dir:
                        # For movie directories, check if folder might contain our movie
                        # For example: alphabetical folders (A-Z), year folders, genre folders
                        href_lower = href.lower()
                        
                        # Check for alphabetical folders
                        first_letter = search_term[0].lower()
                        if href_lower.startswith(first_letter) or first_letter in href_lower:
                            folders.append(full_url)
                            continue
                            
                        # Check for year folders (4-digit numbers)
                        year_match = re.search(r'(19\d\d|20\d\d)', href_lower)
                        if year_match:
                            folders.append(full_url)
                            continue
                            
                        # If folder contains any search word, add it
                        if any(word in href_lower for word in search_words):
                            folders.append(full_url)
                            continue
                            
                        # Add common movie organization folders
                        if any(x in href_lower for x in ['action', 'drama', 'comedy', 'horror', 'thriller']):
                            folders.append(full_url)
                            continue
                    else:
                        # For TV show directories or general directories
                        # Check if ANY of the search words are in the folder name
                        href_lower = href.lower()
                        if any(word in href_lower for word in search_words):
                            folders.append(full_url)
                            
                            # Also check for season subfolders within this folder
                            try:
                                subfolder_response = requests.get(full_url, timeout=5)
                                if subfolder_response.status_code == 200:
                                    subfolder_soup = BeautifulSoup(subfolder_response.text, "html.parser")
                                    
                                    for subfolder_link in subfolder_soup.find_all("a"):
                                        subfolder_href = subfolder_link.get("href")
                                        if subfolder_href and subfolder_href.endswith("/") and subfolder_href != "../" and subfolder_href != "/":
                                            # Check if it's a season folder (contains "season" or "s01", "s02", etc.)
                                            if re.search(r'season|s\d+', subfolder_href.lower()):
                                                season_url = urljoin(full_url, subfolder_href)
                                                folders.append(season_url)
                            except Exception as e:
                                # If error checking subfolders, just continue
                                pass
    except Exception as e:
        print(f"Error in folder search: {str(e)}")
        # If there's an error, just use the base URL
        pass
    
    # Remove duplicates while preserving order
    unique_folders = []
    seen = set()
    for folder in folders:
        if folder not in seen:
            seen.add(folder)
            unique_folders.append(folder)
    
    return unique_folders

def parse_season_episode(filename):
    """Extract season and episode numbers from filename."""
    # Common patterns: S01E02, 1x02, Season 1 Episode 2, etc.
    patterns = [
        r'[Ss](\d+)[Ee](\d+)',  # S01E02
        r'(\d+)[xX](\d+)',      # 1x02
        r'[Ss]eason\s*(\d+)\s*[Ee]pisode\s*(\d+)',  # Season 1 Episode 2
        r'[Ee]p(?:isode)?\s*(\d+)',  # Episode only (assume season 1)
    ]
    
    for pattern in patterns:
        match = re.search(pattern, filename)
        if match:
            groups = match.groups()
            if len(groups) == 2:
                return int(groups[0]), int(groups[1])
            elif len(groups) == 1:
                return 1, int(groups[0])  # Assume season 1
            
    # If folder contains season information
    season_match = re.search(r'[Ss]eason\s*(\d+)', filename)
    if season_match:
        season = int(season_match.group(1))
        # Look for episode number
        ep_match = re.search(r'[Ee]p(?:isode)?\s*(\d+)', filename)
        if ep_match:
            return season, int(ep_match.group(1))
    
    return None, None  # Could not parse

def get_file_links(folder_url, search_term, extensions=None):
    """Scrape media file links from a given folder with improved movie file detection."""
    # Default extensions if none provided
    if extensions is None or not extensions:
        extensions = [".mp4", ".mkv", ".avi"]
    
    # Make sure extensions have dots
    extensions = [ext if ext.startswith('.') else f'.{ext}' for ext in extensions]
    
    # Prepare search terms for more accurate matching
    search_term_lower = search_term.lower()
    # Create a version with spaces replaced by dots/underscores for filename matching
    search_term_filename = search_term_lower.replace(" ", ".")
    search_term_filename2 = search_term_lower.replace(" ", "_")
    # Split into words, filtering out very short words
    search_words = [word.lower() for word in search_term_lower.split() if len(word) > 2]
    
    try:
        print(f"Requesting URL: {folder_url}")
        response = requests.get(folder_url, timeout=15)
        if response.status_code != 200:
            print(f"Failed to access {folder_url}: Status {response.status_code}")
            return []
        
        soup = BeautifulSoup(response.text, "html.parser")
        
        file_links = []
        processed_urls = set()  # Track URLs we've already processed
        
        # First, scan for direct media files in this folder
        for link in soup.find_all("a"):
            href = link.get("href")
            if not href or href == "../" or href == "/":
                continue
                
            # Check if the file has one of our extensions
            if any(href.lower().endswith(ext.lower()) for ext in extensions):
                full_url = urljoin(folder_url, href)
                
                # Skip if we've already processed this URL
                if full_url in processed_urls:
                    continue
                processed_urls.add(full_url)
                
                decoded_name = unquote(href)
                decoded_name_lower = decoded_name.lower()
                
                # MUCH stricter matching criteria:
                is_match = False
                match_reason = ""
                
                # 1. Exact match of full search term
                if search_term_lower in decoded_name_lower:
                    # For single words, make sure it's not just part of another word
                    if len(search_term_lower.split()) == 1:
                        # Check if the word is a standalone word or surrounded by non-alphanumeric chars
                        if re.search(rf'(^|[^a-z0-9]){re.escape(search_term_lower)}([^a-z0-9]|$)', decoded_name_lower):
                            is_match = True
                            match_reason = "exact word match"
                    else:
                        is_match = True
                        match_reason = "exact phrase match"
                
                # 2. Match with dots/underscores instead of spaces (common in filenames)
                elif search_term_filename in decoded_name_lower or search_term_filename2 in decoded_name_lower:
                    is_match = True
                    match_reason = "filename format match"
                
                # 3. For multi-word searches (3+ words), require at least 75% of words to match
                # AND the first word must be present
                elif len(search_words) >= 3:
                    matching_words = [word for word in search_words if word in decoded_name_lower]
                    match_percentage = len(matching_words) / len(search_words)
                    
                    # First word must match and at least 75% of all words
                    if search_words[0] in decoded_name_lower and match_percentage >= 0.75:
                        is_match = True
                        match_reason = f"multi-word match ({match_percentage:.0%})"
                
                # 4. For 2-word searches, both words must be present
                elif len(search_words) == 2:
                    if all(word in decoded_name_lower for word in search_words):
                        is_match = True
                        match_reason = "all words match"
                
                # 5. For single-word searches, word must be present as a distinct part
                # (not just as part of another word)
                elif len(search_words) == 1:
                    word = search_words[0]
                    # Check if word is surrounded by non-alphanumeric chars or start/end of string
                    if re.search(rf'(^|[^a-z0-9]){re.escape(word)}([^a-z0-9]|$)', decoded_name_lower):
                        is_match = True
                        match_reason = "single word match"
                
                # Special case for movies with year in search term
                year_match = re.search(r'(19\d\d|20\d\d)', search_term_lower)
                if not is_match and year_match and year_match.group(1) in decoded_name_lower:
                    # If search has a year and filename has same year, check if any other word matches
                    other_words = [w for w in search_words if w != year_match.group(1)]
                    if any(word in decoded_name_lower for word in other_words):
                        is_match = True
                        match_reason = "movie with year match"
                
                if is_match:
                    season, episode = parse_season_episode(decoded_name)
                    
                    file_links.append({
                        'url': full_url,
                        'name': decoded_name,
                        'season': season,
                        'episode': episode
                    })
                    print(f"Found media file: {decoded_name} ({match_reason})")
        
        # If no direct media files found, check for subfolders
        if not file_links:
            print("No direct media files found, checking subfolders...")
            
            # Find all potential subfolders
            subfolders = []
            for link in soup.find_all("a"):
                href = link.get("href")
                if href and href.endswith("/") and href != "../" and href != "/":
                    subfolder_url = urljoin(folder_url, href)
                    subfolders.append((href, subfolder_url))
            
            # First, check folders that might contain our search terms
            matching_subfolders = []
            for href, subfolder_url in subfolders:
                href_lower = href.lower()
                
                # Similar strict matching for subfolders
                is_match = False
                
                # Exact match
                if search_term_lower in href_lower:
                    is_match = True
                
                # Filename format match
                elif search_term_filename in href_lower or search_term_filename2 in href_lower:
                    is_match = True
                
                # For multi-word searches, first word must match
                elif len(search_words) > 1 and search_words[0] in href_lower:
                    is_match = True
                
                # Single word must match as distinct part
                elif len(search_words) == 1:
                    word = search_words[0]
                    if re.search(rf'(^|[^a-z0-9]){re.escape(word)}([^a-z0-9]|$)', href_lower):
                        is_match = True
                
                # Season folders
                elif re.search(r'season|s\d+', href_lower):
                    is_match = True
                
                if is_match:
                    matching_subfolders.append(subfolder_url)
            
            # Check matching subfolders first
            for subfolder_url in matching_subfolders:
                print(f"Checking subfolder: {subfolder_url}")
                subfolder_files = get_file_links(subfolder_url, search_term, extensions)
                file_links.extend(subfolder_files)
            
            # If still no files and this is a base movie directory, check specific organization patterns
            if not file_links and "movies" in folder_url.lower():
                print("No files found in matching subfolders. Checking movie organization folders...")
                
                # For movies, check alphabetical folders and year folders
                for href, subfolder_url in subfolders:
                    href_lower = href.lower()
                    
                    # Check for first letter match (alphabetical organization)
                    if len(search_term) > 0 and href_lower.startswith(search_term[0].lower()):
                        print(f"Checking alphabetical folder: {subfolder_url}")
                        subfolder_files = get_file_links(subfolder_url, search_term, extensions)
                        file_links.extend(subfolder_files)
                    
                    # Check for year folders if search term contains a year
                    year_match = re.search(r'(19\d\d|20\d\d)', search_term_lower)
                    if year_match and year_match.group(1) in href_lower:
                        print(f"Checking year folder: {subfolder_url}")
                        subfolder_files = get_file_links(subfolder_url, search_term, extensions)
                        file_links.extend(subfolder_files)
        
        return file_links
    except Exception as e:
        print(f"Error in get_file_links for {folder_url}: {str(e)}")
        return []

def create_m3u(playlist_name, file_info_list, save_dir):
    """Generate an M3U playlist from file links, organized by season and episode."""
    if not file_info_list:
        print("No matching files found.")
        return
    
    os.makedirs(save_dir, exist_ok=True)
    file_path = os.path.join(save_dir, f"{playlist_name}.m3u")
    
    # Organize files by season and episode
    organized_files = defaultdict(list)
    movie_files = []
    
    for file_info in file_info_list:
        if file_info['season'] is not None and file_info['episode'] is not None:
            organized_files[(file_info['season'], file_info['episode'])].append(file_info)
        else:
            movie_files.append(file_info)
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write("#EXTM3U\n")
        
        # Write organized files first, sorted by season and episode
        if organized_files:
            f.write("\n# TV Series Episodes\n")
            for season_episode in sorted(organized_files.keys()):
                season, episode = season_episode
                for file_info in organized_files[season_episode]:
                    # Just use a simple standardized format instead of trying to clean the title
                    display_name = f"{playlist_name} - S{season:02d}E{episode:02d}"
                    
                    # Add file extension to display name
                    ext = os.path.splitext(file_info['name'])[1]
                    if ext:
                        display_name += f" [{ext[1:].upper()}]"
                        
                    f.write(f"#EXTINF:-1,{display_name}\n")
                    f.write(f"{file_info['url']}\n")
        
        # Write movie files
        if movie_files:
            f.write("\n# Movies\n")
            for idx, file_info in enumerate(movie_files):
                # For movie files, use the filename or a simple format
                filename = os.path.splitext(file_info['name'])[0]
                ext = os.path.splitext(file_info['name'])[1]
                
                # Clean up the filename
                clean_name = filename.replace(".", " ").replace("_", " ")
                display_name = f"{clean_name}"
                
                if ext:
                    display_name += f" [{ext[1:].upper()}]"
                    
                f.write(f"#EXTINF:-1,{display_name}\n")
                f.write(f"{file_info['url']}\n")
    
    print(f"Playlist saved at: {file_path}")
    return file_path

def open_save_dialog():
    """Open a GUI dialog to select save location and ensure it's in the foreground."""
    root = tk.Tk()
    root.attributes('-topmost', True)  # Make window appear on top
    root.update()  # Update to ensure it's shown
    root.withdraw()  # Hide the main window but keep it on top
    
    directory = filedialog.askdirectory(
        title="Select folder to save playlist",
        initialdir=os.getcwd(),
        parent=root  # Set parent to ensure dialog is also on top
    )
    
    root.destroy()  # Properly close the Tk instance
    
    return directory if directory else os.getcwd()

class FTPPlaylistGeneratorApp:
    def __init__(self, root):
        self.root = root
        self.root.title("FTP M3U Playlist Generator")
        self.root.geometry("600x500")
        self.root.resizable(True, True)
        
        # Load saved categories - modified for portable exe support
        self.categories_file = self.get_categories_file_path()
        self.load_categories()
        
        # Create the UI elements
        self.create_widgets()
    
    def get_categories_file_path(self):
        """Get the path to the categories file, working in both script and exe mode"""
        # Use AppData folder for Windows which is always writable by the user
        appdata_path = os.path.join(os.environ.get('APPDATA', os.path.expanduser('~')), 'FTPPlaylistGenerator')
        
        # Ensure the directory exists
        os.makedirs(appdata_path, exist_ok=True)
        
        # Create the full path to the categories file
        categories_path = os.path.join(appdata_path, "ftp_categories.json")
        print(f"Categories file path: {categories_path}")
        return categories_path
    
    def load_categories(self):
        """Load saved categories from JSON file"""
        self.default_categories = [
            "Select a category...",
            "English Movies- http://server2.ftpbd.net/FTP-2/English%20Movies/",
            "English and Foreign TV Series- http://server4.ftpbd.net/FTP-4/English%20%26%20Foreign%20TV%20Series/",
            "Animation Movies- http://server5.ftpbd.net/FTP-5/Animation%20Movies/",
            "Anime and Cartoon Series- http://server5.ftpbd.net/FTP-5/Anime%20%26%20Cartoon%20TV%20Series/",
            "Documentary- http://server5.ftpbd.net/FTP-5/Documentary/"
        ]
        
        try:
            if os.path.exists(self.categories_file):
                with open(self.categories_file, 'r') as f:
                    saved_categories = json.load(f)
                    # Ensure the first item is always "Select a category..."
                    if saved_categories and saved_categories[0] != "Select a category...":
                        saved_categories.insert(0, "Select a category...")
                    self.url_options = saved_categories
                    print(f"Successfully loaded categories from {self.categories_file}")
            else:
                self.url_options = self.default_categories
                print(f"Categories file not found at {self.categories_file}, using defaults")
        except Exception as e:
            print(f"Error loading categories: {str(e)}")
            self.url_options = self.default_categories
    
    def save_categories(self):
        """Save categories to JSON file"""
        try:
            # Skip the first item ("Select a category...") when saving
            categories_to_save = self.url_options[1:] if len(self.url_options) > 1 else []
            
            # Ensure the directory exists
            categories_dir = os.path.dirname(self.categories_file)
            os.makedirs(categories_dir, exist_ok=True)
            
            # Save the file
            with open(self.categories_file, 'w') as f:
                json.dump(categories_to_save, f, indent=2)
            print(f"Categories saved to {self.categories_file}")
            
            # Verify the file was created
            if os.path.exists(self.categories_file):
                print(f"Verified: Categories file exists at {self.categories_file}")
            else:
                print(f"Warning: Categories file was not created at {self.categories_file}")
        except Exception as e:
            print(f"Error saving categories: {str(e)}")
            # Try an alternative location if the primary location fails
            try:
                alt_path = os.path.join(os.path.expanduser("~"), "ftp_categories.json")
                with open(alt_path, 'w') as f:
                    json.dump(categories_to_save, f, indent=2)
                print(f"Categories saved to alternative location: {alt_path}")
                # Update the path for future saves
                self.categories_file = alt_path
            except Exception as e2:
                print(f"Error saving to alternative location: {str(e2)}")
    
    def add_category(self):
        """Add a new category and URL to the dropdown"""
        category_name = simpledialog.askstring("Add Category", "Enter category name:", parent=self.root)
        if not category_name:
            return
            
        url = simpledialog.askstring("Add URL", "Enter FTP URL for this category:", parent=self.root)
        if not url:
            return
            
        # Format the new entry
        new_entry = f"{category_name}- {url}"
        
        # Add to the list and update dropdown
        self.url_options.append(new_entry)
        self.url_dropdown['values'] = self.url_options
        
        # Save the updated categories
        self.save_categories()
        
        # Show confirmation
        messagebox.showinfo("Category Added", f"Added category: {category_name}")
    
    def edit_category(self):
        """Edit the selected category and URL"""
        selected_index = self.url_dropdown.current()
        
        # Don't allow editing the "Select a category..." option
        if selected_index == 0:
            messagebox.showinfo("Edit Category", "Please select a category to edit.")
            return
            
        selected = self.url_dropdown.get()
        
        # Split the category name and URL
        if "- " in selected:
            category_name, url = selected.split("- ", 1)
        else:
            category_name = ""
            url = selected
            
        # Ask for new category name
        new_category_name = simpledialog.askstring("Edit Category", 
                                                 "Enter new category name:", 
                                                 parent=self.root,
                                                 initialvalue=category_name)
        if new_category_name is None:  # User cancelled
            return
            
        # Ask for new URL
        new_url = simpledialog.askstring("Edit URL", 
                                       "Enter new FTP URL for this category:", 
                                       parent=self.root,
                                       initialvalue=url)
        if new_url is None:  # User cancelled
            return
            
        # Format the new entry
        new_entry = f"{new_category_name}- {new_url}"
        
        # Update the list and dropdown
        self.url_options[selected_index] = new_entry
        self.url_dropdown['values'] = self.url_options
        self.url_dropdown.current(selected_index)
        
        # Update the URL field
        self.url_var.set(new_url)
        
        # Save the updated categories
        self.save_categories()
        
        # Show confirmation
        messagebox.showinfo("Category Updated", f"Updated category: {new_category_name}")
    
    def delete_category(self):
        """Delete the selected category"""
        selected_index = self.url_dropdown.current()
        
        # Don't allow deleting the "Select a category..." option
        if selected_index == 0:
            messagebox.showinfo("Delete Category", "Please select a category to delete.")
            return
            
        selected = self.url_dropdown.get()
        
        # Get category name for confirmation message
        category_name = selected.split("- ", 1)[0] if "- " in selected else selected
        
        # Confirm deletion
        confirm = messagebox.askyesno("Confirm Deletion", 
                                     f"Are you sure you want to delete the category '{category_name}'?",
                                     parent=self.root)
        if not confirm:
            return
            
        # Remove from the list and update dropdown
        self.url_options.pop(selected_index)
        self.url_dropdown['values'] = self.url_options
        
        # Reset to first item
        self.url_dropdown.current(0)
        self.url_var.set("")
        
        # Save the updated categories
        self.save_categories()
        
        # Show confirmation
        messagebox.showinfo("Category Deleted", f"Deleted category: {category_name}")
    
    def create_widgets(self):
        # Main frame
        main_frame = tk.Frame(self.root, padx=10, pady=10)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # URL input
        tk.Label(main_frame, text="FTP URL:").grid(row=0, column=0, sticky=tk.W, pady=5)
        self.url_var = tk.StringVar()
        
        # Create a frame to hold the dropdown, entry field, and add button
        url_frame = tk.Frame(main_frame)
        url_frame.grid(row=0, column=1, sticky=tk.EW, pady=5)
        
        # Create the dropdown for predefined URLs
        self.url_dropdown = tk.ttk.Combobox(url_frame, values=self.url_options, width=40)
        self.url_dropdown.current(0)
        self.url_dropdown.pack(side=tk.LEFT, fill=tk.X, expand=True)
        self.url_dropdown.bind("<<ComboboxSelected>>", self.update_url_from_dropdown)
        
        # Category management buttons
        category_buttons_frame = tk.Frame(url_frame)
        category_buttons_frame.pack(side=tk.RIGHT)
        
        # Add button for new categories
        tk.Button(category_buttons_frame, text="+", command=self.add_category, width=3).pack(side=tk.LEFT, padx=2)
        # Edit button for existing categories
        tk.Button(category_buttons_frame, text="✎", command=self.edit_category, width=3).pack(side=tk.LEFT, padx=2)
        # Delete button for categories
        tk.Button(category_buttons_frame, text="✕", command=self.delete_category, width=3).pack(side=tk.LEFT, padx=2)
        
        # Entry field for URL (below the dropdown)
        tk.Entry(main_frame, textvariable=self.url_var, width=50).grid(row=1, column=1, sticky=tk.EW, pady=5)
        
        # Search term input
        tk.Label(main_frame, text="Movie/Series Name:").grid(row=2, column=0, sticky=tk.W, pady=5)
        self.search_var = tk.StringVar()
        tk.Entry(main_frame, textvariable=self.search_var, width=50).grid(row=2, column=1, sticky=tk.EW, pady=5)
        
        # File extensions
        tk.Label(main_frame, text="File Extensions:").grid(row=3, column=0, sticky=tk.W, pady=5)
        self.extensions_var = tk.StringVar(value=".mp4, .mkv, .avi")
        tk.Entry(main_frame, textvariable=self.extensions_var, width=50).grid(row=3, column=1, sticky=tk.EW, pady=5)
        
        # Save location
        tk.Label(main_frame, text="Save Location:").grid(row=4, column=0, sticky=tk.W, pady=5)
        self.save_location_frame = tk.Frame(main_frame)
        self.save_location_frame.grid(row=4, column=1, sticky=tk.EW, pady=5)
        
        self.save_var = tk.StringVar(value=os.getcwd())
        tk.Entry(self.save_location_frame, textvariable=self.save_var, width=40).pack(side=tk.LEFT, fill=tk.X, expand=True)
        tk.Button(self.save_location_frame, text="Browse", command=self.browse_save_location).pack(side=tk.RIGHT, padx=5)
        
        # Progress frame
        progress_frame = tk.LabelFrame(main_frame, text="Progress", padx=5, pady=5)
        progress_frame.grid(row=5, column=0, columnspan=2, sticky=tk.EW, pady=10)
        
        self.progress_var = tk.DoubleVar()
        self.progress_bar = tk.ttk.Progressbar(progress_frame, variable=self.progress_var, maximum=100)
        self.progress_bar.pack(fill=tk.X, expand=True, pady=5)
        
        self.status_var = tk.StringVar(value="Ready")
        tk.Label(progress_frame, textvariable=self.status_var, wraplength=550).pack(fill=tk.X, expand=True)
        
        # Log frame
        log_frame = tk.LabelFrame(main_frame, text="Log", padx=5, pady=5)
        log_frame.grid(row=6, column=0, columnspan=2, sticky=tk.NSEW, pady=10)
        
        self.log_text = tk.Text(log_frame, height=10, width=70, wrap=tk.WORD)
        self.log_text.pack(fill=tk.BOTH, expand=True)
        
        # Add scrollbar to log
        scrollbar = tk.Scrollbar(log_frame, command=self.log_text.yview)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        self.log_text.config(yscrollcommand=scrollbar.set)
        
        # Button frame
        button_frame = tk.Frame(main_frame)
        button_frame.grid(row=7, column=0, columnspan=2, pady=10)
        
        tk.Button(button_frame, text="Generate Playlist", command=self.generate_playlist).pack(side=tk.LEFT, padx=5)
        tk.Button(button_frame, text="Exit", command=self.root.destroy).pack(side=tk.LEFT, padx=5)
        
        # Configure grid weights
        main_frame.columnconfigure(1, weight=1)
        main_frame.rowconfigure(6, weight=1)  # Updated to make the log frame expandable
    
    def browse_save_location(self):
        directory = filedialog.askdirectory(
            title="Select folder to save playlist",
            initialdir=self.save_var.get()
        )
        if directory:
            self.save_var.set(directory)
    
    def update_url_from_dropdown(self, event):
        selected = self.url_dropdown.get()
        if selected != "Select a category...":
            # Extract the URL part after the hyphen
            url = selected.split("- ", 1)[1] if "- " in selected else selected
            self.url_var.set(url)
    
    def log_message(self, message):
        from datetime import datetime
        self.log_text.insert(tk.END, f"{datetime.now().strftime('%H:%M:%S')} - {message}\n")
        self.log_text.see(tk.END)
        self.root.update_idletasks()
    
    def update_status(self, message):
        self.status_var.set(message)
        self.log_message(message)
        self.root.update_idletasks()
    
    def update_progress(self, value=None, message=None):
        if value is not None:
            self.progress_var.set(value)
        if message is not None:
            self.update_status(message)
        self.root.update_idletasks()
    
    def generate_playlist(self):
        base_url = self.url_var.get().strip()
        search_term = self.search_var.get().strip()
        save_dir = self.save_var.get().strip()
        
        if not base_url or not search_term:
            tk.messagebox.showerror("Error", "Please enter both FTP URL and search term.")
            return
        
        # Parse extensions
        extensions = [ext.strip() for ext in self.extensions_var.get().split(',')]
        
        # Reset progress
        self.progress_var.set(0)
        self.update_status("Starting search...")
        
        # Run in a separate thread to keep UI responsive
        import threading
        threading.Thread(target=self._generate_playlist_thread, 
                         args=(base_url, search_term, save_dir, extensions),
                         daemon=True).start()
    
    def _generate_playlist_thread(self, base_url, search_term, save_dir, extensions):
        try:
            # Step 1: Find folders
            self.update_status("Searching for matching folders...")
            folders = get_folders_recursive(base_url, search_term)
            
            if not folders:
                self.update_status("No matching folders found.")
                tk.messagebox.showinfo("Search Complete", "No matching folders found.")
                return
            
            self.update_status(f"Found {len(folders)} folders. Searching for media files...")
            self.progress_var.set(25)
            
            # Step 2: Find files in folders
            all_file_info = []
            folder_count = len(folders)
            
            # Track URLs to avoid duplicates
            processed_urls = set()
            
            for i, folder in enumerate(folders):
                self.update_status(f"Scanning folder {i+1}/{folder_count}: {folder}")
                files_found = get_file_links(folder, search_term, extensions)
                
                # Only add files that haven't been processed yet and match the search term
                for file_info in files_found:
                    if file_info['url'] not in processed_urls:
                        processed_urls.add(file_info['url'])
                        all_file_info.append(file_info)
                        self.log_message(f"Added: {file_info['name']}")
                    else:
                        self.log_message(f"Skipped (duplicate): {file_info['name']}")
                        
                self.progress_var.set(25 + (50 * (i+1) / folder_count))
            
            if not all_file_info:
                self.update_status("No media files found matching your search term.")
                tk.messagebox.showinfo("Search Complete", "No media files found matching your search term.")
                return
            
            # Step 3: Create playlist
            self.update_status(f"Creating playlist with {len(all_file_info)} files...")
            playlist_path = create_m3u(search_term.replace(" ", "_"), all_file_info, save_dir)
            
            self.progress_var.set(100)
            self.update_status(f"Playlist created successfully at: {playlist_path}")
            
            # Show success message
            tk.messagebox.showinfo("Success", 
                                 f"Created playlist with {len(all_file_info)} files.\n\nLocation: {playlist_path}")
            
        except Exception as e:
            self.update_status(f"Error: {str(e)}")
            tk.messagebox.showerror("Error", f"An error occurred: {str(e)}")

# Update the main function to support both CLI and GUI modes
def main():
    # Check if GUI mode or command line mode
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--cli":
        # Command line mode - use original code
        base_url = input("Enter FTP URL: ")
        search_term = input("Enter movie/series name: ")
        
        print("Select where to save the playlist...")
        save_dir = open_save_dialog()
        
        print("Searching for matching folders...")
        folders = get_folders_recursive(base_url, search_term)
        
        if not folders:
            print("No matching folders found.")
            return
        
        print(f"Found {len(folders)} folders. Searching for media files...")
        all_file_info = []
        for folder in folders:
            all_file_info.extend(get_file_links(folder, search_term))
        
        if all_file_info:
            playlist_path = create_m3u(search_term.replace(" ", "_"), all_file_info, save_dir)
            print(f"Created playlist with {len(all_file_info)} files organized by season and episode when possible.")
            print(f"Playlist location: {playlist_path}")
        else:
            print("No media files found.")
    else:
        # GUI mode
        root = tk.Tk()
        from tkinter import messagebox
        app = FTPPlaylistGeneratorApp(root)
        root.mainloop()

if __name__ == "__main__":
    main()