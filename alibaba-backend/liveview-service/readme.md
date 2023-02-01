https://stackoverflow.com/questions/28253681/you-need-to-install-postgresql-server-dev-x-y-for-building-a-server-side-extensi
https://askubuntu.com/questions/1129841/how-to-solve-unmet-dependencies-with-libpq5



#locate all the env 
locate -b '\activate' | grep "/home"
source live-view-test/bin/activate)



#for psycopg
sudo apt --fix-broken install
sudo apt-get install postgresql
sudo apt-get install python-psycopg2
sudo  apt-get install libpq5=10.22-0ubuntu0.18.04.1
sudo apt-get install libpq-dev
