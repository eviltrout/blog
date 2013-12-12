(function() {

  var slides = [];

  var App = Ember.Application.create({
    ready: function() {
      var previous = null;

      $('script[type="text/slide-handlebars"]').each(function (idx, slide) {
        var slideId = slide.id;

        if (slideId.indexOf('slides/') === 0) {
          var attrs = $(slide).data();
          attrs.id = slideId.replace('slides/', '');
          attrs.previous = previous;

          var newSlide = App.Slide.create(attrs);
          if (previous) {
            previous.set('next', newSlide);
          }

          slides.push(newSlide);
          previous = newSlide;
        }

        Ember.TEMPLATES[slideId] = Ember.Handlebars.compile(slide.innerHTML);
      });
    }
  });

  var state;
  App.InfiniteScrollComponent = Ember.Component.extend({
    templateName: 'infinite_scroll',

    click: function() {
      if (state === 'not-started') { state = 'down'; }
    },

    didInsertElement: function() {
      var y = 10;
          lastTick = new Date().getTime(),
          self = this,
          $svg = this.$('svg'),
          $viewPort = this.$('#viewport')
          height = 200,
          yPerc = 1.0;

      state = 'not-started'

      $lines = $('line.orig', $svg);
      $lines.each(function (i, l) {
        var $line = $(l);
        $line.data('originalY', $line.attr('y1'));
      });

      function animLoop() {

        var now = new Date().getTime();
            delta = now - lastTick;

        $viewPort.attr({y: y, height: height});

        switch(state) {
          case 'down':
            y += (delta / 15);
            if (y > 400) {
              state = 'pauseBottom';
              pauseUntil = now + 4000;
              $('#load-more').show();
            }
            break;
          case 'pauseBottom':
            if (now > pauseUntil) {
              state = 'up';
              yPerc = 1.0;
              $('#load-more').hide();
            }
            break;
          case 'up':
            var yDelta = (delta / 10.0);

            yPerc = yPerc - (delta / 1000);
            y = (300 * yPerc) + 100;
            height = (200 * yPerc);

            if (yPerc < 0.5) {
              state = 'scrollAgain';
              $('line.new').show();
              $('#more-inserted').show();
            }

            $lines.each(function (i, l) {
              var $line = $(l),
                  newY = (($line.data('originalY') - 90) * yPerc) + (90 * yPerc);

              $line.attr('y1', newY).attr('y2', newY);
            });
            break;

          case 'scrollAgain':
            y = y + (delta / 20);
            if (y > 400) {
              pauseUntil = now + 2000;
              state = 'endPause';
            }
            break;

          case 'endPause':
            if (now > pauseUntil) {
              y = 10;
              height = 200;
              state = 'down';
              $('line.new').hide();
              $lines.each(function (i, l) {
                var $line = $(l);
                $line.attr('y1', $line.data('originalY')).attr('y2', $line.data('originalY'));
              });

            }

        }

        if (!self.get('finished')) {
          lastTick = now;
          requestAnimationFrame(animLoop);
        }
      }
      animLoop();
    },

    willDestroyElement: function() {
      this.set('finished', true);
    }

  });

  App.Slide = Ember.Object.extend({
    templateName: function() {
      return 'slides/' + this.get('id');
    }.property('id')
  });

  App.Router.map(function() {
    this.resource("slide", { path: "/slide/:id" });
  });

  App.SlideView = Ember.View.extend({

    resizeElements: function() {
      var widthRatio = $(window).width() / 1024.0,
          heightRatio = $(window).height() / 768.0;

      this.$('code, textarea.code-editor').css('font-size', (30 * widthRatio) + 'px');
      this.$('h1').css('font-size', (5 * widthRatio) + 'em');
      this.$('h2').css('font-size', (3 * widthRatio) + 'em');
      this.$('h2.small').css('font-size', (2 * widthRatio) + 'em');
      this.$('.code-container, pre').css('width', (950 * widthRatio) + 'px');
      this.$('.code-container textarea, code').css('width', (920 * widthRatio) + 'px');
    },

    _slideChanged: function() {
      if (this.get('state') === 'inDOM') {
        Em.run.scheduleOnce('afterRender', this, 'resizeElements');
      }
    }.observes('controller.id'),

    didInsertElement: function() {
      var self = this;

      Em.run.scheduleOnce('afterRender', self, 'resizeElements');
      $(window).on('resize.slides', function() {
        Em.run.scheduleOnce('afterRender', self, 'resizeElements');
      });

      $(document).off('keyup.slides').on('keyup.slides', function(e) {
        switch(e.which) {
          case 39:
            self.get('controller').send('goNext');
            break;
          case 37:
            self.get('controller').send('goPrevious');
            break;
        }
      });
    },

    willDestroyElement: function() {
      $(document).off('keyup.slides');
      $(window).off('resize.slides');
    }
  });

  App.IndexRoute = Ember.Route.extend({
    redirect: function() {
      this.transitionTo('slide', slides[0]);
    }
  });

  App.RouteExampleView = Ember.View.extend({
    templateName: 'route_example',

    classify: function() {
      return (this.get('resource') || '').camelize().capitalize();
    }.property('resource'),

    _valueChanged: function() {
      var value = this.get('value');

      if (value) {
        var m = /this\.resource\(\'([a-zA-Z]*)\'/.exec(value);
        if (m) {
          var resource = m[1];
          this.set('resource', resource)
        }
      }
    }.observes('value')

  });

  var transitioning = false;
  function fadeToSlide(router, slide, next) {
    if (!slide) { return; }

    var $stage = $('#stage');

    if (transitioning) {
      // If we're in a previous fade, stop it and go right away.
      $stage.stop().css('opacity', '0');

      if (next) {
        slide = slide.get('next') || slide;
      } else {
        slide = slide.get('prev') || slide;
      }

      router.replaceWith('slide', slide).then(function() {
        $stage.css('opacity', '1.0');
        transitioning = false;
      });

      return;
    }

    transitioning = true;
    $stage.animate({ opacity: 0 }, {
      duration: 200,
      complete: function() {
        router.transitionTo('slide', slide).then(function () {
          $stage.animate({opacity: 1}, {
            duration: 200,
            complete: function() {
              transitioning = false;
            }
          });
        })
      }
    });
  }

  App.RenderedCode = Ember.CollectionView.extend({
    init: function() {
      this._super();

      if (this.get('customView')) {
        this.pushObject(this.createChildView(this.get('customView'), {valueBinding: 'parentView.value'}));
      }
    },

    _valueChanged: function() {
      var value = this.get('value');
      if (this.get('type') === 'handlebars') {
        if (value) {
          var compiledTemplate = Ember.Handlebars.compile(value);
          this.clear();
          this.pushObject(this.createChildView(Ember.View, {
            classNameBindings: [':html-preview'],
            template: compiledTemplate
          }));
        }
      }

      if (this.get('type') === 'component') {
        Ember.TEMPLATES['components/fabulous-text'] = Ember.Handlebars.compile(value);
      }

    }.observes('value')
  });

  App.CodeContentsMixin = Ember.Mixin.create({
    createCodeContents: function() {
      var codeContents = document.getElementById(this.get('filename')).innerHTML.replace(/^\n*/, '').trim(),
          lines = codeContents.split("\n");

      var maxSpaces = 10000;
      lines.forEach(function (l) {
        var match = l.match(/^\s+[^\s]/);

        if (match && match[0]) {
          var length = match[0].length - 1;
          if (length < maxSpaces) { maxSpaces = length; }
        }
      });

      if (maxSpaces < 10000) {
        var spaces = "";
        for (var i=0; i<lines.length; i++) {
          var line = lines[i];
          if (line && line.length > maxSpaces) {
            lines[i] = line.replace(new RegExp("^\\s{" + maxSpaces + "}"), '');
          }
        }
      }

      this.set('codeContents', lines.join("\n"));
    }
  });

  App.HighlightCodeComponent = Ember.Component.extend(App.CodeContentsMixin, {
    didInsertElement: function() {
      this.createCodeContents();

      if (this.get('language') !== 'plain') {
        Em.run.next(function() {
          this.$('pre code').each(function(i, e) {hljs.highlightBlock(e)});
        });
      }

    }
  });

  App.EditableCodeComponent = Ember.Component.extend(App.CodeContentsMixin, {
    _codeContentsChanged: function() {
      this.set('value', this.get('codeContents'));
      if (this.get('type') === 'component') {
        Ember.TEMPLATES[this.get('filename')] = Ember.Handlebars.compile(this.get('codeContents'));
      }
    }.observes('codeContents'),

    didInsertElement: function() {
      this.createCodeContents();
      var $textArea = this.$('.code-editor');
      Em.run.next(function() { $textArea.elastic(); });
    },
  });

  App.SlideRoute = Ember.Route.extend({
    model: function(params) {
      return slides.findBy('id', params.id);
    },

    renderTemplate: function() {
      var model = this.modelFor('slide');
      this.render('slide', {into: 'application'});
      this.render(model.get('templateName'), {into: 'slide', outlet: 'slideOutlet'});
    },

    actions: {
      goNext: function() {
        if ($(document.activeElement).is('textarea')) { return }
        fadeToSlide(this, this.modelFor('slide').get('next'), true);
      },

      goPrevious: function() {
        if ($(document.activeElement).is('textarea')) { return }
        fadeToSlide(this, this.modelFor('slide').get('previous'), false);
      }
    }
  });

  window.App = App;
})();