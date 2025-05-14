# React Website Setup Guide for dnd.lueshub.com

## Server Configuration

- **Web Server**: Apache
- **Document Root**: `/var/www/dnd.lueshub.com`
- **Node.js Version**: v18.19.1
- **npm Version**: 9.2.0
- **User Permissions**: User `dnd` is in `www-data` group

## Server Setup Steps

### 1. Create React App

```bash
# Create a new React application
cd ~
npx create-react-app dnd-app

# Build the React application
cd dnd-app
npm run build
```

### 2. Apache Configuration

The site is configured in: `/etc/apache2/sites-enabled/dnd.lueshub.com.conf`

Key settings:
```apache
<VirtualHost *:80>
    ServerName dnd.lueshub.com
    DocumentRoot /var/www/dnd.lueshub.com

    <Directory /var/www/dnd.lueshub.com>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    # Cache control headers to prevent browser caching
    <IfModule mod_headers.c>
        Header set Cache-Control "no-cache, no-store, must-revalidate"
        Header set Pragma "no-cache"
        Header set Expires 0
    </IfModule>
</VirtualHost>
```

### 3. React App .htaccess

To make React router work properly, create an .htaccess file in the build directory:

```
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### 4. Deployment Process

When you need to update the website, follow these steps:

```bash
# 1. Navigate to your React app directory
cd ~/dnd-app

# 2. Make your changes to the code

# 3. Build the app for production
npm run build

# 4. Create .htaccess file (if it doesn't exist)
echo '<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>' > build/.htaccess

# 5. Deploy to web directory
sudo rm -rf /var/www/dnd.lueshub.com/*
sudo cp -R build/* /var/www/dnd.lueshub.com/
sudo cp build/.htaccess /var/www/dnd.lueshub.com/
sudo chown -R dnd:www-data /var/www/dnd.lueshub.com/
sudo chmod -R 775 /var/www/dnd.lueshub.com/
```

### 5. Enabled Apache Modules

The following Apache modules need to be enabled:
- mod_rewrite
- mod_headers

Enable them with:
```bash
sudo a2enmod rewrite
sudo a2enmod headers
sudo systemctl restart apache2
```

## Database Connection

The database credentials (from sql structure.txt):
```
$db_host = 'localhost';
$db_user = 'dnd_user';
$db_pass = 'LETme1n2dnd11!!';
$db_name = 'dnd_campaigns';
```

## Additional Notes

- Remember to clear browser cache if you encounter unexpected behavior after updates
- For API development, consider creating a separate directory (e.g., `/api`) and configuring Apache to pass those requests to your backend
- Keep backups of your React code and database

SQL Structure:
campaigns    id    int
  campaigns    name    varchar
  characters    id    int
  characters    user_id    int
  characters    campaign_id    int
  characters    name    varchar
  characters    race    varchar
  characters    class    varchar
  characters    level    int
  characters    strength    int
  characters    dexterity    int
  characters    constitution    int
  characters    intelligence    int
  characters    wisdom    int
  characters    charisma    int
  characters    hit_points    int
  characters    armor_class    int
  characters    background    text
  characters    equipment    text
  characters    max_hit_points    int
  characters    temp_hit_points    int
  characters    short_rest_count    int
  characters    long_rest_count    int
  characters    gold    int
  characters    silver    int
  characters    copper    int
  characters    spell_save_dc    int
  characters    spell_attack_bonus    int
  characters    spell_slots_json    json
  characters    known_spells    text
  characters    weapons    text
  characters    gear    text
  characters    notes    varchar
  characters    custom_resources    text
  common_rolls    id    int
  common_rolls    user_id    int
  common_rolls    name    varchar
  common_rolls    formula    varchar
  roles    id    int
  roles    name    varchar
  rolls    id    int
  rolls    user_id    int
  rolls    timestamp    datetime
  rolls    action    varchar
  rolls    roll    varchar
  rolls    total    int
  rolls    rolls_json    text
  rolls    modifier    int
  user_campaigns    user_id    int
  user_campaigns    campaign_id    int
  user_groups    user_id    int
  user_groups    role_id    int
  users    id    int
  users    username    varchar
  users    password    varchar


$db_host = 'localhost';
$db_user = 'dnd_user';
$db_pass = 'LETme1n2dnd11!!';
$db_name = 'dnd_campaigns';


