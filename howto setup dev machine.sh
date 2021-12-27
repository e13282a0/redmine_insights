#packages
sudo apt-get install ruby-rubygems mysql-client libmysqlclient-dev ruby-dev git subversion mariadb-server snapd

#get redmine from svn
svn co https://svn.redmine.org/redmine/branches/4.2-stable redmine-4.2

#install vs code
sudo snap install code --classic

#execute in redmine folder packages for rails dev server
gem install ruby-debug-ide
gem install debase

#setup redmine database
sudo mariadb -e "CREATE DATABASE redmine CHARACTER SET utf8mb4;"
sudo mariadb -e "CREATE DATABASE redmine_development CHARACTER SET utf8mb4;"
sudo mariadb -e "CREATE DATABASE redmine_test CHARACTER SET utf8mb4;"
sudo mariadb -e "CREATE USER 'redmine'@'localhost' IDENTIFIED BY 'my_password';"
sudo mariadb -e "GRANT ALL PRIVILEGES ON redmine.* TO 'redmine'@'localhost';"
sudo mariadb -e "GRANT ALL PRIVILEGES ON redmine_development.* TO 'redmine'@'localhost';"
sudo mariadb -e "GRANT ALL PRIVILEGES ON redmine_test.* TO 'redmine'@'localhost';"

#configure database.yml
#production:
#  adapter: mysql2
#  database: redmine
#  host: localhost
#  username: redmine
#  password: "my_password" 
#etc...

# install bundler and install redmine
gem install bundler
bundle install --without development test

#migrate database
RAILS_ENV=development bundle exec rake db:migrate
RAILS_ENV=production bundle exec rake db:migrate

#execute in redmine folder: set file system permissions
mkdir -p tmp tmp/pdf public/plugin_assets
sudo chown -R redmine:redmine files log tmp public/plugin_assets
sudo chmod -R 755 files log tmp public/plugin_assets
