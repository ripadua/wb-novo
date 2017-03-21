angular.module('warningbox', ['ionic', 'warningbox.controllers', 'warningbox.services', 'warningbox.constants', 'ngCordova', 'ngStorage'])

.run(function($ionicPlatform, $rootScope, $cordovaPushV5, WB_CONFIG) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
    
    var options = {
    	android: {
    	  senderID: WB_CONFIG.PUSH_ANDROID_SENDER_ID
    	},
      ios: {
        alert: "true",
        badge: "true",
        sound: "true"
      },
      windows: {}
    };
    
    //Inicializa o plugin de push notification
    $cordovaPushV5.initialize(options).then(function() {
      //Começa a ouvir por novas notificações
      $cordovaPushV5.onNotification();
      //Começa a ouvir os erros
      $cordovaPushV5.onError();
      
      //Registra para obter a registrationid
      $cordovaPushV5.register().then(function(registrationId) {
        $rootScope.registrationid = registrationId;
      });
    });
    
    //Disparado quando uma notificação é recebida
    $rootScope.$on('$cordovaPushV5:notificationReceived', function(event, data){
      $rootScope.clicouAlerta = true;
    });
  
    //Disparado quando um erro ocorrer
    $rootScope.$on('$cordovaPushV5:errorOcurred', function(event, e){
      console.log(e.message);
    });
  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  
  $ionicConfigProvider.tabs.position('bottom'); 
  
  $stateProvider

  .state('deslogado', {
    url: '/deslogado',
    abstract: true,
    templateUrl: 'templates/deslogado.html'
  })
  
  .state('deslogado.login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  })
  
  .state('deslogado.cadastro', {
    url: '/cadastro',
    templateUrl: 'templates/cadastro.html',
    controller: 'CadastroCtrl'
  })
  
  .state('deslogado.ajuda', {
    url: '/ajuda',
    templateUrl: 'templates/ajuda.html',
    controller: 'AjudaCtrl'
  })
  
  .state('deslogado.recuperasenha', {
    url: '/recuperasenha',
    templateUrl: 'templates/recuperasenha.html',
    controller: 'RecuperaSenhaCtrl'
  })
  
  .state('logado', {
    url: '/logado',
    abstract: true,
    templateUrl: 'templates/abas.html',
    controller: 'AbasCtrl'
  })
  
  .state('logado.alerta', {
    url: '/alerta',
    views: {
      "logado-alerta": {
        templateUrl: 'templates/alerta.html',
        controller: 'AlertaCtrl'
      }
    },
    data: {
      nome: 'Alertas'
    }
  })
  
  .state('logado.produto', {
    url: '/produto',
    views: {
      'logado-produto': {
        templateUrl: 'templates/produto.html',
        controller: 'ProdutoCtrl'
      }
    },
    data: {
      nome: 'Produtos'
    }
  })
  
  .state('logado.camera', {
    url: '/camera',
    views: {
      'logado-camera': {
        templateUrl: 'templates/camera.html',
        controller: 'CameraCtrl'
      }
    },
    data: {
      nome: 'Cadastro de Produto'
    }
  })
  
  .state('logado.perfil', {
    url: '/perfil',
    views: {
      'logado-perfil': {
        templateUrl: 'templates/perfil.html',
        controller: 'PerfilCtrl'
      }
    },
    data: {
      nome: 'Perfil'
    }
  })
  
  .state('logado.relatorio', {
    url: '/relatorio',
    views: {
      'logado-relatorio': {
        templateUrl: 'templates/relatorio.html',
        controller: 'RelatorioCtrl'
      }
    },
    data: {
      nome: 'Relatório'
    }
  });
  
  // Se não for chamado nenhum dos states acima, vai para tela de login
  $urlRouterProvider.otherwise('/deslogado/login');
});