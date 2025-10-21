# Python script to generate a bcrypt password hash
#
# REQUIREMENTS: You must have Python installed and the 'bcrypt' library.
# To install: pip install bcrypt
#
# INSTRUCTIONS:
# 1. Save this file as hash_generator.py
# 2. Run in your terminal: python hash_generator.py
# 3. Enter the desired plain-text password when prompted.
# 4. Copy the resulting HASHED STRING.
# 
# 
# INSERT INTO admin_users (username, password_hash)
# VALUES ('your_new_admin_username', 'PASTE_THE_LONG_HASH_STRING_YOU_COPIED_HERE');
# Once that is done, your new admin user will be secure and ready to log in!
# 
# Now that the security foundation is complete, are you ready to test the image display functionality in the **`gallery.html`** and **`gallery.js`** files we discussed earlier?

import bcrypt

# The salt rounds should match your upserver.js (which is 10)
SALT_ROUNDS = 10 

def generate_hash():
    """Prompts for a password and prints the bcrypt hash."""
    
    # Get the password from user input
    password = input("Enter the desired ADMIN password: ")
    
    # Encode the password string to bytes (required by bcrypt)
    password_bytes = password.encode('utf-8')
    
    # Generate the salt and hash
    # The hash generated here will be compatible with the bcrypt.compare in your Node.js server
    hashed_password_bytes = bcrypt.hashpw(password_bytes, bcrypt.gensalt(SALT_ROUNDS))
    
    # Decode the hash bytes back to a string for easy copying
    hashed_password_string = hashed_password_bytes.decode('utf-8')
    
    print("\n-------------------------------------------------------------")
    print(f"✅ HASH GENERATED ({SALT_ROUNDS} rounds):")
    print(hashed_password_string)
    print("-------------------------------------------------------------")
    print("COPY THIS LONG STRING and use it in your SQL INSERT statement.")

if __name__ == "__main__":
    generate_hash()








