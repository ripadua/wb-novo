angular.module('warningbox.controllers', [])

.controller('AppCtrl', function($rootScope, $scope, $timeout, $localStorage, VersaoService, ParametroService, EstabelecimentoService, $state) {

  $scope.stateAnterior = "";
  
  //Cria o objeto wb no localStorage caso não exista
  if (!$localStorage.wb) {
    $localStorage.wb = {};
    $localStorage.wb.produtos = [];
    $localStorage.wb.estabelecimentos = [];
    $localStorage.wb.categorias = [];
  }
  
  //Verifica se o usuário clicou em um alerta. Se tiver clicado o sistema vai 
  //direcionar o usuario para a pagina de alertas após o login
  if ($rootScope.clicouAlerta == true) {
      $rootScope.visualizaAlertas = true;
      $rootScope.clicouAlerta = false;
  } else {
      $rootScope.visualizaAlertas = false;
  }
  
  //VersaoService.isVersaoValida();
  
  ParametroService.consultarParametroPorNome('categorias').then(function(response){
    $localStorage.wb.categorias = response.data.valor.split(',');
  });
  
  if ($localStorage.wb.usuario) {
    EstabelecimentoService.consultarEstabelecimentosPorUsuario($localStorage.wb.usuario.email).then(function(response){
      $localStorage.wb.estabelecimentos = response.data;
    });
  }
  
  $scope.abrirAjuda = function() {
    $state.go('deslogado.ajuda');
  };
  
  $rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
    $scope.stateAnterior = from;
  });
  
  $scope.voltar = function() {
    $state.go($scope.stateAnterior);
  }
  
  $scope.mostrarAjuda = function() {
    return $state.current.name != 'deslogado.ajuda';
  };
  
  $scope.mostrarVoltar = function() {
    return $state.current.name != 'deslogado.login';
  };
  
  $scope.sair = function() {
    $localStorage.wb = {};
    $state.go('deslogado.login');
  };
  
  $scope.possuiCodigoRecuperacaoSenha = function() {
    return $localStorage.wb.codigo_recuperar_senha;
  };
})

//Controlador da tela de login
.controller('LoginCtrl', function($rootScope, $scope, $localStorage, $state, $ionicPopup, $ionicLoading, $http, VersaoService, EmailService, UsuarioService, EstabelecimentoService) {
  
  //objeto que armazena as informações de login
  $scope.data = {};
  
  //Se já existir o email no localStorage, então define o valor do localStorage no campo da tela
  if ($localStorage.wb.usuario) {
    $state.go('logado.alerta');
  }
  
  //Acao executada quando o usuário clicar em Entrar
  $scope.entrar = function(formLogin) {
    
    //Executa o loading
    $ionicLoading.show({});
    
    //Verifica se a versao do aplicativo é valida
    //if (!VersaoService.isVersaoValida()) {
    //  $ionicLoading.hide();
    //  return;
    //}
    
    //Verifica se o usuário informou um email para entrar
    if (formLogin.email.$error.required) {
      $ionicPopup.alert({
        title: 'WarningBox',
        cssClass: 'text-center',
        template: 'Insira o seu endereço de e-mail para entrar.'
      });
      
      $ionicLoading.hide();
      return;
    }

    //Verifica se o email informado é valido
    if (formLogin.email.$error.email) {
      $ionicPopup.alert({
        title: 'WarningBox',
        cssClass: 'text-center',
        template: 'O email informado não é valido. Por favor informe um e-mail válido para entrar.'
      });
      
      $ionicLoading.hide();
      return;
    }
    
    //Verifica se o usuário informou uma senha para entrar
    if (formLogin.senha.$error.required) {
      $ionicPopup.alert({
        title: 'WarningBox',
        cssClass: 'text-center',
        template: 'Insira a sua senha para entrar.'
      });
      
      $ionicLoading.hide();
      return;
    }
    
    //Verifica se o aparelho estiver online
    if (navigator.onLine) {
      UsuarioService.autenticarUsuario($scope.data).then(function(response){
        if (response.data == '1') {
          
          UsuarioService.atualizarIdPushUsuario($scope.data.email, $rootScope.registrationid).then(function(response){
            $localStorage.wb.usuario = response.data;
          }, function(e) {
            console.log(e);
          });
          
          EstabelecimentoService.consultarEstabelecimentosPorUsuario($scope.data.email).then(function(response){
            $localStorage.wb.estabelecimentos = response.data;
          });
          
          $ionicLoading.hide();
          $state.go('logado.alerta');
            
        } else if (response.data == '2') {
          $ionicPopup.alert({
            title: 'WarningBox',
            cssClass: 'text-center',
            template: 'Não foi possível entrar no sistema. Favor confirmar dados da assinatura e forma de pagamento.'
          });
          $ionicLoading.hide();
        } else {
          $ionicPopup.alert({
            title: 'WarningBox',
            cssClass: 'text-center',
            template: 'Usuário e/ou senha inválidos.'
          });
          $ionicLoading.hide();
        }
      });  
    } else {
      
      $ionicPopup.alert({
        title: 'WarningBox',
        cssClass: 'text-center',
        template: 'Para realizar o login é preciso estar online. Conecte-se em alguma rede e tente novamente.'
      });
      $ionicLoading.hide();
      
    }    
  };
  
  $scope.abrirCadastro = function() {
    delete $localStorage.wb.cadastro_usuario;
    $state.go('deslogado.cadastro');
  };
  
  $scope.abrirRecuperaSenha = function() {
    delete $localStorage.wb.codigo_recuperar_senha;
    $state.go('deslogado.recuperasenha');
  };
  
  $scope.abrirInformaCodigo = function() {
    $state.go('deslogado.recuperasenha');
  };
  
  $scope.testeDetran = function() {
    $http.get("http://10.110.71.64:8080/psw/rest/raw/start")
      .then(function(response){
        $ionicPopup.alert({
          title: 'WarningBox',
          cssClass: 'text-center',
          template: response.data
        });
      }, function(error){
        $ionicPopup.alert({
          title: 'WarningBox',
          cssClass: 'text-center',
          template: error.data
        });
      });
  }
  
})

//Controlador da tela de cadastro
.controller('CadastroCtrl', function($rootScope, $scope, $localStorage, $state, $ionicPopup, $ionicLoading, $http, UsuarioService){
  
  //objeto que armazena as informações do usuário
  $scope.data = {};
  
  if ($localStorage.wb.cadastro_usuario) {
    $scope.data.email = $localStorage.wb.cadastro_usuario;
  }
  
  //Funcao invocada quando o usuario clica em cadastrar
  $scope.cadastrar = function(formUsuario) {
    
    //Executa o loading
    $ionicLoading.show({});
    
    //Verifica se o usuário informou um email para cadastrar
    if (formUsuario.email.$error.required) {
      $ionicPopup.alert({
        title: 'WarningBox',
        cssClass: 'text-center',
        template: 'Insira o seu endereço de e-mail para cadastrar.'
      });
      
      $ionicLoading.hide();
      return;
    }

    //Verifica se o email informado é valido
    if (formUsuario.email.$error.email) {
      $ionicPopup.alert({
        title: 'WarningBox',
        cssClass: 'text-center',
        template: 'O email informado não é valido. Por favor informe um e-mail válido para cadastrar.'
      });
      
      $ionicLoading.hide();
      return;
    }
    
    //Verifica se o usuário informou uma senha para cadastrar
    if (formUsuario.senha.$error.required) {
      $ionicPopup.alert({
        title: 'WarningBox',
        cssClass: 'text-center',
        template: 'Insira a senha para cadastrar.'
      });
      
      $ionicLoading.hide();
      return;
    }
    
    //Verifica se o usuário repetiu a senha para cadastrar
    if (formUsuario.repetirsenha.$error.required) {
      $ionicPopup.alert({
        title: 'WarningBox',
        cssClass: 'text-center',
        template: 'Insira a sua senha novamente para cadastrar.'
      });
      
      $ionicLoading.hide();
      return;
    }
    
    if ($scope.data.senha != $scope.data.repetirsenha) {
      $ionicPopup.alert({
        title: 'WarningBox',
        cssClass: 'text-center',
        template: 'As duas senhas informadas não coincidem.'
      });
      
      $ionicLoading.hide();
      return;
    }
    
    var usuario = {
      email: $scope.data.email,
      senha: $scope.data.senha,
      idpush: $rootScope.registrationid
    };
    
    UsuarioService.cadastrarUsuario(usuario).then(function(response){
      $localStorage.wb.usuario = {
        categoria: response.data.categoria,
        codigo_de_barras: response.data.codigo_de_barras,
        codigo_indicador: response.data.codigo_indicador,
        email: response.data.email,
        id: response.data.id,
        idpush: response.data.idpush,
        nome: response.data.nome,
        quantidade: response.data.quantidade,
        valor: response.data.valor
      };
      
      $ionicPopup.alert({
          title: 'WarningBox',
          cssClass: 'text-center',
          template: 'Usuário cadastrado com sucesso.'
      });
      
      delete $localStorage.wb.cadastro_usuario;
      
      $state.go('logado.alerta');
      $ionicLoading.hide();
    }, function(response){
      $ionicPopup.alert({
          title: 'WarningBox',
          cssClass: 'text-center',
          template: 'Ocorreu um erro ao cadastrar o usuário. Tente novamente.'
      });
      $ionicLoading.hide();
    });
  };
})

//Controlador da tela de ajuda
.controller('AjudaCtrl', function($rootScope, $scope, $localStorage, $state, WB_CONFIG){
  $scope.contatos = {
    skype: WB_CONFIG.CONTATO_SKYPE,
    whatsapp: WB_CONFIG.CONTATO_WHATSAPP,
    mail: WB_CONFIG.CONTATO_MAIL
  };
  $scope.versao = WB_CONFIG.VERSAO_APLICACAO;
})

//Controlador da tela de alertas
.controller('RecuperaSenhaCtrl', function($rootScope, $scope, $localStorage, $state, $ionicPopup, $ionicLoading, $http, UsuarioService){
  
  //objeto que armazena o email para recuperacao
  $scope.data = {};
  $scope.alteraSenha = false;
  
  $scope.apresentaEmail = function() {
    return !$localStorage.wb.codigo_recuperar_senha;
  };
  
  $scope.apresentaCodigo = function() {
    return $localStorage.wb.codigo_recuperar_senha && !$scope.alteraSenha;
  };
  
  $scope.apresentaSenha = function() {
    return $scope.alteraSenha;
  };
  
  //Funcao executada quando o usuario clica em enviar
  $scope.enviar = function(formRecuperaSenha) {
    
    //Executa o loading
    $ionicLoading.show({});
    
    //Verifica se o usuário informou um email para cadastrar
    if (formRecuperaSenha.email.$error.required) {
      $ionicPopup.alert({
        title: 'WarningBox',
        cssClass: 'text-center',
        template: 'Informe o seu endereço de e-mail para recuperar a senha.'
      });
      
      $ionicLoading.hide();
      return;
    }

    //Verifica se o email informado é valido
    if (formRecuperaSenha.email.$error.email) {
      $ionicPopup.alert({
        title: 'WarningBox',
        cssClass: 'text-center',
        template: 'O email informado não é valido. Por favor informe um e-mail válido para recuperar a senha.'
      });
      
      $ionicLoading.hide();
      return;
    }
    
    var codigo = Math.floor((Math.random() * 999999) + 1);
        	
    UsuarioService.enviarEmailRecuperaSenha($scope.data.email, codigo).then(function(response){
      
      if (response.data == 0) {
        
        $localStorage.wb.codigo_recuperar_senha = codigo;
        $localStorage.wb.email_recuperar_senha = $scope.data.email;
        $ionicPopup.alert({
            title: 'WarningBox',
            cssClass: 'text-center',
            template: 'Um código foi enviado no email informado. Por favor verifique o código e acesse o WarningBox novamente.'
        });
        $state.go('deslogado.login');
        $ionicLoading.hide();
      } else if (response.data == 9) {
         
        $ionicLoading.hide();
        var confirmacao = $ionicPopup.confirm({
            title: 'WarningBox',
            cssClass: 'text-center',
            template: 'O e-mail informado não está cadastrado em nossa base de dados. Deseja se cadastrar?'
        });
        
        confirmacao.then(function(res){
          if (res) {
            $localStorage.wb.cadastro_usuario = $scope.data.email;
            $state.go("deslogado.cadastro");
          } else {
            
          }
        });
        
      } else {
        
        $ionicPopup.alert({
            title: 'WarningBox',
            cssClass: 'text-center',
            template: 'Ocorreu um erro ao enviar email com código. Por favor tente novamente.'
        });
        $ionicLoading.hide();
      }
    });
  };
  
  $scope.validarCodigo = function(formCodigo) {
    //Executa o loading
    $ionicLoading.show({});
    
    //Verifica se o usuário informou um o código para recuperar a senha
    if (formCodigo.codigo.$error.required) {
      $ionicPopup.alert({
        title: 'WarningBox',
        cssClass: 'text-center',
        template: 'Informe o código para recuperar a senha.'
      });
      
      $ionicLoading.hide();
      return;
    }

    if ($scope.data.codigo == $localStorage.wb.codigo_recuperar_senha) {
      $scope.alteraSenha = true;
    } else {
      $ionicPopup.alert({
        title: 'WarningBox',
        cssClass: 'text-center',
        template: 'O código informado é diferente do que foi enviado por e-mail. Por favor verifique o código e tente novamente.'
      });
    }
    
    $ionicLoading.hide();
  };
  
  $scope.alterarSenha = function(formSenha) {
    
    //Verifica se o usuário informou uma senha para alterar
    if (formSenha.senha.$error.required) {
      $ionicPopup.alert({
        title: 'WarningBox',
        cssClass: 'text-center',
        template: 'Insira a senha para alterar.'
      });
      
      $ionicLoading.hide();
      return;
    }
    
    //Verifica se o usuário repetiu a senha para alterar
    if (formSenha.repetirsenha.$error.required) {
      $ionicPopup.alert({
        title: 'WarningBox',
        cssClass: 'text-center',
        template: 'Insira a sua senha novamente para alterar.'
      });
      
      $ionicLoading.hide();
      return;
    }
    
    if ($scope.data.senha != $scope.data.repetirsenha) {
      $ionicPopup.alert({
        title: 'WarningBox',
        cssClass: 'text-center',
        template: 'As duas senhas informadas não coincidem.'
      });
      
      $ionicLoading.hide();
      return;
    }
    
    var usuario = {
      email: $localStorage.wb.email_recuperar_senha,
      senha: $scope.data.senha
    };
    
    UsuarioService.atualizarSenhaUsuario(usuario).then(function(response){
      $ionicPopup.alert({
        title: 'WarningBox',
        cssClass: 'text-center',
        template: 'Senha atualizada com sucesso.'
      });
      
      $ionicLoading.hide();
      
      $localStorage.wb.usuario = response.data;
      delete $localStorage.wb.codigo_recuperar_senha;
      $state.go('deslogado.login');
    }, function(e) {
      $ionicPopup.alert({
        title: 'WarningBox',
        cssClass: 'text-center',
        template: 'Ocorreu um erro ao atualizar a senha. Por favor tente novamente.'
      });
      
      $ionicLoading.hide();
    });
  };
})

//Controlador da tela de alertas
.controller('AlertaCtrl', function($rootScope, $scope, $localStorage, $state, $ionicPopup, $ionicLoading, $http){
  
})

//Controlador da tela de produtos
.controller('ProdutoCtrl', function($rootScope, $scope, $localStorage, $state, $ionicPopup, $ionicLoading, $http){
  $scope.produtos = $localStorage.wb.produtos;
  
  $scope.abrirProduto = function(produto) {
    $state.go('logado.camera');
    $rootScope.$broadcast('abrir-camera', produto);
  };
})

//Controlador da tela de camera
.controller('CameraCtrl', function($rootScope, $scope, $localStorage, $state, $ionicPopup, $ionicLoading, $http, $cordovaCamera){
  
  //objeto que receberá os dados do produto
  $scope.data = {};
  $scope.categorias = $localStorage.wb.categorias;
  $scope.estabelecimentos = $localStorage.wb.estabelecimentos;
  
  $scope.tirarFoto = function() {
    
    var options = {
      quality: 50,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.CAMERA,
      allowEdit: true,
      encodingType: Camera.EncodingType.JPEG,
      targetWidth: 300,
      targetHeight: 300,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false,
	    correctOrientation:true
    };
  
    $cordovaCamera.getPicture(options).then(function(imageData) {
      var image = document.getElementById('imagem');
      image.src = "data:image/jpeg;base64," + imageData;
      $scope.data.imagem = imageData;
    }, function(err) {
      // error
    });
  };
  
  $scope.salvar = function() {
    $ionicLoading.show();
    
    $localStorage.wb.produtos.push($scope.data);
    $scope.data = {};
    $scope.data.data_vencimento = new Date(new Date().getTime() + 4 * 24 * 60 * 60 * 1000);
    
    $ionicPopup.alert({
        title: 'WarningBox',
        cssClass: 'text-center',
        template: 'O produto foi cadastrado com sucesso.'
    });
      
    $ionicLoading.hide();
    $state.go('logado.produto');
  };
  
  $scope.apresentaCampoCategoria = function() {
    return $localStorage.wb.usuario.categoria;
  };
  
  $scope.apresentaCampoCodigoBarras = function() {
    return $localStorage.wb.usuario.codigo_de_barras;
  };
  
  $scope.apresentaCampoQuantidade = function() {
    return $localStorage.wb.usuario.quantidade;
  };
  
  $scope.apresentaCampoValor = function() {
    return $localStorage.wb.usuario.valor;
  };
  
  $scope.$on('abrir-camera', function(event, produto){
    
    if (produto) {
      $scope.data = produto;
      var image = document.getElementById('imagem');
      image.src = "data:image/jpeg;base64," + produto.imagem;
    } else {
      $scope.data = {};
      var image = document.getElementById('imagem');
      image.src = "../img/placeholder.png";
      $scope.data.data_vencimento = new Date(new Date().getTime() + 4 * 24 * 60 * 60 * 1000);
    }
  });
})

//Controlador da tela de perfil
.controller('PerfilCtrl', function($rootScope, $scope, $localStorage, $state, $ionicPopup, $ionicLoading, $http){
  
})

//Controlador da tela de relatorio
.controller('RelatorioCtrl', function($rootScope, $scope, $localStorage, $state, $ionicPopup, $ionicLoading, $http){

})

//Controlador das abas
.controller('AbasCtrl', function($rootScope, $scope, $localStorage, $state, $ionicPopup, $ionicLoading, $http){
  
  $scope.obterNomeTela = function() {
    return $state.current.data.nome;  
  };
  
  $scope.abrirCadastroProduto = function() {
    $state.go('logado.camera');
    $rootScope.$broadcast('abrir-camera');
  };
});
