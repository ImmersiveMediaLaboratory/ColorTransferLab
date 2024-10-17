import os
import json

def rename_files_in_folder(folder_path):
    # Get a list of all files in the folder
    files = [f for f in os.listdir(folder_path) if os.path.isfile(os.path.join(folder_path, f))]
    
    # Sort the list of files alphabetically
    files.sort()
    
    # Loop through the sorted list and rename each file
    for index, filename in enumerate(files):
        # Create the new filename
        new_filename = f"image{index:03d}{os.path.splitext(filename)[1]}"
        
        # Get the full paths
        old_file = os.path.join(folder_path, filename)
        new_file = os.path.join(folder_path, new_filename)
        
        # Rename the file
        os.rename(old_file, new_file)
        print(f"Renamed '{filename}' to '{new_filename}'")

def extract_info_from_filename(filename):
    parts = filename.split('_')
    x = float(parts[-3])
    y = float(parts[-2])
    return x, y

def create_json_from_files(folder_path, output_json_path):
    # Get a list of all files in the folder
    files = [f for f in os.listdir(folder_path) if os.path.isfile(os.path.join(folder_path, f))]
    
    # Sort the list of files alphabetically
    files.sort()
    
    # Create the JSON structure
    json_data = {}
    
    for filename in files:
        parts = filename.split('_')
        outer_key = parts[1]
        inner_key = parts[2]
        x, y = extract_info_from_filename(filename)
        
        if outer_key not in json_data:
            json_data[outer_key] = {}
        
        json_data[outer_key][inner_key] = (x, y)
    
    # Save the JSON structure to a file
    with open(output_json_path, 'w') as json_file:
        json.dump(json_data, json_file, indent=4)
    
    print(f"JSON data saved to '{output_json_path}'")

#Example usage
#folder_path = '/home/potechius/Downloads/rectified'
#rename_files_in_folder(folder_path)

# folder_path = '/home/potechius/Downloads/chess'
# output_json_path = '/home/potechius/Downloads/output.json'
# create_json_from_files(folder_path, output_json_path)


import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

def send_email(subject, body, to_email, from_email, smtp_server, smtp_port, smtp_user, smtp_password):
    # Erstellen Sie das MIME-Multipart-Objekt
    msg = MIMEMultipart()
    msg['From'] = from_email
    msg['To'] = to_email
    msg['Subject'] = subject

    # Fügen Sie den Textkörper zur Nachricht hinzu
    msg.attach(MIMEText(body, 'plain'))

    try:
        # Verbinden Sie sich mit dem SMTP-Server und senden Sie die E-Mail
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()  # Verwenden Sie TLS für die Sicherheit
        server.login(smtp_user, smtp_password)
        server.send_message(msg)
        server.quit()

        print(f"E-Mail erfolgreich an {to_email} gesendet.")
    except Exception as e:
        print(f"Fehler beim Senden der E-Mail: {e}")
