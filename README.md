*This project repository was originaly private and could not be made public, so it has been copied to this public repo for visibility/archival purposes. Everything has remained the same where possible.*  
<hr/>
&nbsp    

# BUMETCS673S21T1

<p>Development Guide. Explanations of what's happening, how to install, and some resources</p>

![Heroku](https://pyheroku-badge.herokuapp.com/?app=plan-ly)

[Heroku server](https://plan-ly.herokuapp.com/)


<hr/>

## 📝Table of Contents
- [Getting Started](#getting-started)
- [Install](#install)
    - [Pulling from Development](#pulling-from-development)
- [Deployment](#deployment)
- [Usage](#usage)
    - [Codebase Structure](#codebase-structure)
    - [Database](#database)
- [Contributing](#contributing)
    - [Adding New Packages](#adding-new-packages)
    - [Coding Guidelines](#coding-guidelines)
    - [Making a Pull Request](#making-a-pull-request)
- [Resources](#resources)

## 🏁Getting Started 
This project requires node, npm and python to be able to run React and Django. Make sure you have them installed

## ⚙️Install 
### Setting up Django
```bash
python -m venv venv
venv\Scripts\activate.bat
python -m pip install -r requirements.txt
python manage.py runserver
```
### Setting up React
```bash
npm install
npm start
```

Go to backend/urls.py and comment out `re_path(".*", TemplateView.as_view(template_name="index.html"))` while you are developing. Otherwise you will get TemplateNotFound errors whenever you try to access anything Django related on localhost:8000. Remember to comment it back in when you're making a pull request! 

Localhost:3000 should automatically open but if it doesn't navigate to http://localhost:3000 yourself

The React frontend is now connected to the Django backend. You can go to localhost:8000/api/items to see how Django is handling items added to the database

*If requirements.txt doesn't work or throws an error, you will need to install the required packages yourself. Go into requirements.txt and install all of the listed packages or run the following:
```bash
python -m pip install django djangorestframework django-cors-headers dj-database-url django-allauth django-heroku djongo dnspython gunicorn psycopg2 psycopg2-binary PyJWT pymongo python-dotenv whitenoise black pylint
```

**If you are using a mac, the script to activate venv is different. Use `source venv/bin/activate`

### Pulling from Development
Every time you pull a new update from the development branch, you need to check to see if there any new packages you need ot download. Run the following:
- `npm install` to check for and install any new npm packages
- `python -m pip install -r requirements.txt` to check for and install any new python packages

## 🚀Deployment
The development branch gets deployed to [development-planly.herokuapp.com](https://development-planly.herokuapp.com/), where all changes, fixes, and tests can be seen live before development gets merged into main.

The production version of Plan.ly is deployed to [plan-ly.herokuapp.com](https://plan-ly.herokuapp.com/). All new features should be tested and working on [development-planly](https://development-planly.herokuapp.com/) before they go live on [plan-ly](https://plan-ly.herokuapp.com/)

Our Heroku dpeloyment uses two buildpacks, heroku/nodejs and heroku/python. Each buildback runs the build process for its respective framework and installs dependencies and modules into Heroku so that the app can run. Becaus React apps are served from a single static file, the Django build process creates a build folder that npm inserts the React build folder into. For static files Django creates a static folder in the base build folder to serve any static files (images, .js, etc.)

The backend serves up API endpoints that are hidden in production that connects the React frontend and the Django backend.


## 💻Usage

### Codebase Structure
These are the directories currently being used for development:

**Backend**
- `backend`: The main Django folder, contains `settings.py` and `urls.py`
- `core`: the core app that was created. Currently contains the user and item models, as well as `views.py`

**Front End**
- `src`: contains all of the import React files
- `src/components`: houses all of the React components
- `src/App.js`: composition of the react app

**Src/components**
All components must follow the same structure:

    component-folder-name
    |
    |---component-name.js
    |---component.name.css

**Django Apps**
If you are going to create a new Django app, make sure it follows the following conventions: lowercase and words separtated with "-"
e.g. `new-django-app`

Make sue the app is explicitly named - it should describe what the app will be responsible for.

e.g. `todos`, or `users`

### Database
The database being used is MongoDB, and it is connected to our app with a python package called Djongo. The connection uri is in backend/settings.py and should not be touched.

Djonjo is a database mapper, which means translates Django’s native sql queries to MongoDB statements. For us, that means we can use the Django model system as normal, and Djongo will translate the queries we’re making to MongoDb

For example, the Item model currently exists in `core/models.py`. Instead of from Django import models, we have from djongo import models, which ensures our models are connected to djongo and will be turned into MongoDB items

If you add a new class or edit any of the existing classes, make sure you migrate your changes with `python manage.py makemigrations`. 

Django has a built in backend interface you can access at `localhost:8000/admin`. It requires a superuser to acceess it and I have already created one. The username is 'admin' and the password is 'password'. You will be able to see a list of all the users registered and a list of all the items created, as well as some other settings.

## Contributing
In order to ensure effective quality managment, when contributing to the repository:
- first pull from `development` to ensure you have the most recent version of deployment available
- Then create a new branch based on `development`. Do NOT create a new branch based on `main`*
- Your new branch should adhere to the following syntax:
    - `/feature/feature-name`
    - `/fix/fix-name`
- When your feature is complete, create a pull request to merge it into `deployment`
- Once your feature is merged, you can delete your branch if you will not be using it again

The only time you should create a branch based on `main` is if you are implementing a hotfix on the main branch

Make sure you are committing code OFTEN. Essentially, whenever you complete a step in the workflow of whatever you are working on, make a commit. It'll help everyone to see your progress and if something breaks from one commit to the next, it will be easier for us (and you) to roll back to the previous commit.

### Adding new packages
If you added a new npm package or python package, make sure you make note of that in your pull request. Right before you commit your code to make a pull request, run `python -m pip freeze > requirements.txt`. What that does is add your package name to the requirements.txt file so that it can be installed by everyone else when they pull from development. For npm packages, they automaticaly get added to the package.json file so you don't have to worry about that.

### Coding Guidelines
For code being pushed, functions should have comments that describe their purpose, making it easier for reviewers to look over pull requests.

Pull requests should outline what has been added/changed in the branch being merged

Your code will follow guidelines established by linters. JavaScript will follow standards set by eslint and Python will follow standards set by pylint and black.

Eslint should automatically lint your file as you code (if you are using VS Code you will see any issues pop up in 'Problems'). Otherwise, you can run `npx eslint yourfile.js` or `yarn run eslint yourfile.js` to lint your file

Your IDE will mostly have pylint installed in some capactiy, but if you want to check your file manually, you can run `pylint yourfile.py`, which will print out any errors, warning, or incorrect conventions. Our C/I pipeline also uses black to format Python, and you can also run `black yourfile.py` to automatically format your code.

### Making a Pull Request
When you make a pull request, name your pull request appropriately and in your initial comment outline all the changes your branch makes. When the pull request is created, 2 things will happen.  
1. Vibhu, George, and Zach will automatically get added to your pull request to review your code. 
2. Your code will be linted, ensuring it follows all guidelines. If your code fails, you can go to the 'checks' tab of your pull request and click on 'Lint Code Base'. You will be able to read through all of your code and see where it failed

Once your code passes the linting test and is approved by Vibhu, George, or Zach it will be merged into development.

If your code fails, you will be able to continually push code to the open pull request until it passes either the linting or review. If eslint or pylint is giving you an error for something you have deliberately done, let us know in your pull request and we can talk about it.

Remember to undo the `re_path(".*", TemplateView.as_view(template_name="index.html"))` comment in backend/urls.py! If you forget I will ask you to add it back in the code review

## 📚Resources
Here are a collection of resources if you get stuck

- [ReactJS Official Documentation](https://reactjs.org/docs/getting-started.html)
- [Django Official Documentation](https://www.djangoproject.com/start/)
- [Mongo DB Documentation](https://docs.mongodb.com/guides/)
- [About Django models](https://docs.djangoproject.com/en/3.1/topics/db/models/)
- [Djongo Documentation](https://www.djongomapper.com/)
- [Routing for React](https://reactrouter.com/)
- [A solid overview of using React + Axios to make requests](https://www.digitalocean.com/community/tutorials/react-axios-react)

