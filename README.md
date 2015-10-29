# Smart-phone-recommendation
Smart phone recommendation using raccoon


# recommendationRaccoon engine built on top of Node.js. It is a full installation of the module that takes advantage of lightning fast recommendations and simple user interface. It comes complete with sample content and tests.

## Dependencies

* Async
* CSV
* Express
* MongoDB
* Mongoose
* Node
* Raccoon - crucial
* Redis - crucial
* Underscore

## How to install locally

#### Clone the repo
``` bash
git clone https://github.com/guymorita/Mosaic-Films---Recommendation-Engine-Demo.git
```

#### Navigate to the folder
``` bash
cd 
```

#### Install ALL dependencies
``` bash
npm install
```

#### Make sure Raccoon's sampleContent is true
```` js
/node_modules/raccoon/config.js
  // make sure - sampleContent: true
```

#### Boot up servers in separate terminal windows
``` bash
redis-server
```
``` bash
```mongod
```
``` bash
node node-server.js
```

#### Import Movies
* First Go to http://localhost:3000/importMovies
* If you're on a different local host, change it out

#### It's ready! Try the home page
* http://localhost:3000/
