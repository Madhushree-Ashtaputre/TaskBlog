var expressSanitizer = require('express-sanitizer'),
methodOverride = require('method-override'),
bodyParser = require('body-parser'),
mongoose       = require('mongoose')
express        = require('express'),
app            = express();

mongoose.connect("mongodb://localhost/restful_blog_app", { useNewUrlParser: true });

app.set("view engine", "ejs");

app.use(express.static("public")); 

app.use(bodyParser.urlencoded({extended:true}));
app.use(expressSanitizer());

app.use(methodOverride("_method"));


// Create blog
var blogSchema = new mongoose.Schema({
  title: String,
  image: String,
  body: String,
  created: {type: Date, default: Date.now}
});


var Blog = mongoose.model('Blog', blogSchema);


app.get('/', function(req, res) {
  res.redirect('/blogs');
})


app.get('/blogs', function(req, res) {
  Blog.find({}, function(err, blogs) {
    if(err) {
      console.log(err);
    } else {
      
      res.render('index', {blogs: blogs});
    }
  });
});


app.get('/blogs/new', function(req, res) {
  
  res.render('new');
});

// add
app.post('/blogs', function(req, res) {
  // for resisting XSS 
  req.body.blog.body = req.sanitize(req.body.blog.body);
  Blog.create(req.body.blog, function(err, newBlog) {
    if(err) {
      res.render('new');
    } else {
      res.redirect('/blogs');
    }
  }) 
});




app.get('/blogs/:id', function(req, res) {
 
  Blog.findById(req.params.id, function(err, foundBlog) {
    if(err) {
      res.redirect("/blogs");
    } else {
    
      res.render("show", {blog: foundBlog});
    }
  })
});


app.get('/blogs/:id/edit', function(req, res) {
  
  Blog.findById(req.params.id, function(err, foundBlog) {
    if(err) {
      res.redirect('/blogs');
    } else {
      
      res.render('edit', {blog: foundBlog});
    }
  })
});

// UPDATE 
app.put('/blogs/:id', function(req, res) {
  // Prevent XSS
  req.body.blog.body = req.sanitize(req.body.blog.body);
  
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog) {
    if(err) {
      res.redirect('/blogs');
    } else {
      
      res.redirect('/blogs/' + req.params.id);
    }
  })
});

// DELETE 
app.delete('/blogs/:id', function(req, res) {
 
  Blog.findByIdAndRemove(req.params.id, function(err) {
    if(err) {
      res.redirect('/blogs');
    } else {
      res.redirect('/blogs');
    }
  })
  // redirect somewhere

});

// running on port 8080
app.listen(8080, function(req, res) {
  console.log(" server is running...")
})
