angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    
    
    .state('paginaInicial', {
      url: '/paginaInicial',
      templateUrl: 'templates/paginaInicial.html'
    })
        
    .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html'
    })

    .state('novoPerfil', {
      url: '/novoPerfil',
      templateUrl: 'templates/signup.html'
    })    
      
  
    .state('menu', {
      url: '/side-menu',
      abstract:true,
      templateUrl: 'templates/menu.html'
    })
      
    .state('menu.home', {
      url: '/menuHome',
      views: {
        'side-menu': {
          templateUrl: 'templates/home.html'
        }
      }
    })


    .state('menu.alergiasLista', {
      url: '/alergiasLista',
      views: {
        'side-menu': {
          templateUrl: 'templates/alergiasLista.html'
        }
      }
    })
      
    .state('alergiasAdicionar', {
      url: '/alergiasAdicionar',
      templateUrl: 'templates/alergiasAdicionar.html',
      controller: 'alergiasAdicionarCtrl'
    })  

    .state('alergiasEditar', {
      url: '/alergiasEditar/:alergiaId',
      templateUrl: 'templates/alergiasEditar.html',
      controller: 'alergiasEditarCtrl'
    })  


    .state('menu.historico', {
      url: '/historico',
      views: {
        'side-menu': {
          templateUrl: 'templates/historico.html'
        }
      }
    })

    .state('menu.dadosPaciente', {
      url: '/dadosPaciente',
      views: {
        'side-menu': {
          templateUrl: 'templates/dadosPaciente.html'
        }
      }
    })

    .state('menu.eventosLista', {
      url: '/eventosLista',
      views: {
        'side-menu': {
          templateUrl: 'templates/eventosLista.html'
        }
      }
    })
      
    .state('eventosAdicionar', {
      url: '/eventosAdicionar',
      templateUrl: 'templates/eventosAdicionar.html',
      controller: 'eventosAdicionarCtrl'
    })  

    .state('eventosEditar', {
      url: '/eventosEditar/:eventoId',
      templateUrl: 'templates/eventosEditar.html',
      controller: 'eventosEditarCtrl'
    })  

    .state('menu.lembrancasLista', {
      url: '/lembrancasLista',
      views: {
        'side-menu': {
          templateUrl: 'templates/lembrancasLista.html'
        }
      }
    })
      
    .state('lembrancasAdicionar', {
      url: '/lembrancasAdicionar',
      templateUrl: 'templates/lembrancasAdicionar.html',
      controller: 'lembrancasAdicionarCtrl'
    })  

    .state('lembrancasEditar', {
      url: '/lembrancasEditar/:lembrancaId',
      templateUrl: 'templates/lembrancasEditar.html',
      controller: 'lembrancasEditarCtrl'
    })  

    .state('menu.contatosLista', {
      url: '/contatosLista',
      views: {
        'side-menu': {
          templateUrl: 'templates/contatosLista.html'
        }
      }
    })
      
    .state('contatosAdicionar', {
      url: '/contatosAdicionar',
      templateUrl: 'templates/contatosAdicionar.html',
      controller: 'contatosAdicionarCtrl'
    })  

    .state('contatosEditar', {
      url: '/contatosEditar/:contatoId',
      templateUrl: 'templates/contatosEditar.html',
      controller: 'contatosEditarCtrl'
    })  

    
    .state('menu.dicasLista', {
      url: '/dicasLista',
      views: {
        'side-menu': {
          templateUrl: 'templates/dicasLista.html'
        }
      }
    })
      
    .state('dicasAdicionar', {
      url: '/dicasAdicionar',
      templateUrl: 'templates/dicasAdicionar.html',
      controller: 'dicasAdicionarCtrl'
    })  

    .state('dicasEditar', {
      url: '/dicasEditar/:dicaId',
      templateUrl: 'templates/dicasEditar.html',
      controller: 'dicasEditarCtrl'
    })  

    .state('menu.doencasLista', {
      url: '/doencasLista',
      views: {
        'side-menu': {
          templateUrl: 'templates/doencasLista.html'
        }
      }
    })
      
    .state('doencasAdicionar', {
      url: '/doencasAdicionar',
      templateUrl: 'templates/doencasAdicionar.html',
      controller: 'doencasAdicionarCtrl'
    })  

    .state('doencasEditar', {
      url: '/doencasEditar/:doencaId',
      templateUrl: 'templates/doencasEditar.html',
      controller: 'doencasEditarCtrl'
    })  
    
    
    .state('menu.medicosLista', {
      url: '/medicosLista',
      views: {
        'side-menu': {
          templateUrl: 'templates/medicosLista.html'
        }
      }
    })
      
    .state('medicosAdicionar', {
      url: '/medicosAdicionar',
      templateUrl: 'templates/medicosAdicionar.html',
      controller: 'medicosAdicionarCtrl'
    })  

    .state('medicosEditar', {
      url: '/medicosEditar/:medicoId',
      templateUrl: 'templates/medicosEditar.html',
      controller: 'medicosEditarCtrl'
    })  

    .state('menu.medicamentosLista', {
      url: '/medicamentosLista',
      views: {
        'side-menu': {
          templateUrl: 'templates/medicamentosLista.html'
        }
      }
    })
      
    .state('medicamentosAdicionar', {
      url: '/medicamentosAdicionar',
      templateUrl: 'templates/medicamentosAdicionar.html',
      controller: 'medicamentosAdicionarCtrl'
    })  

    .state('medicamentosEditar', {
      url: '/medicamentosEditar/:medicamentoId',
      templateUrl: 'templates/medicamentosEditar.html',
      controller: 'medicamentosEditarCtrl'
    })  
  // if none of the above states are matched, use this as the fallback
  
  $urlRouterProvider.otherwise('/paginaInicial');
  

  

});