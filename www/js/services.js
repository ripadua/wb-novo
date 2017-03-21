angular.module('warningbox.services', [])

.service('VersaoService', function($http, $ionicPopup, WB_CONFIG){
    
    this.isVersaoValida = function() {
      //Busca a versão da aplicação nos parametros do servidor. 
      //Utilizamos esse valor para validar a versão da aplicação
      $http.get(WB_CONFIG.SERVIDOR + "/consultarParametroPorNome?nome=aplicacao.versao").then(function(response){
        var versao_servidor = response.data.valor;
        
        //Se a versão da aplicação for diferente da versão do servidor entao mostra mensagem e para execução
        if (WB_CONFIG.VERSAO_APLICACAO != versao_servidor) {
          $ionicPopup.show({
            title: 'WarningBox',
            cssClass: 'text-center',
            template: 'Versão ' + versao_servidor + ' disponível para atualização.',
            buttons: [
              {
                text: 'Atualizar',
                type: 'button-positive',
                onTap: function(e) {
                  if (ionic.Platform.isAndroid()) {
                    window.open(WB_CONFIG.ENDERECO_PLAY_STORE);
                  } else if (ionic.Platform.isIOS() || ionic.Platform.isIPad()) {
                    window.open(WB_CONFIG.ENDERECO_APP_STORE);
                  }
                }
              }
            ]
          });
          return false;
        }
        return true;
      }, function(response) {
        console.log(response);
      });
    };
        
})

.service('EmailService', function(){
    
})

.service('ParametroService', function($http, WB_CONFIG){
  
  this.consultarParametroPorNome = function(nome) {
    return $http.get(WB_CONFIG.SERVIDOR + "/consultarParametroPorNome?nome=" + nome);  
  };
    
})

.service('EstabelecimentoService', function($http, WB_CONFIG){
  
  this.consultarEstabelecimentosPorUsuario = function(email) {
    return $http.get(WB_CONFIG.SERVIDOR + "/consultarEstabelecimentosPorUsuario?usuario=" + email);  
  };
    
})

.service('UsuarioService', function($http, WB_CONFIG){
    
    this.consultarUsuarioPorEmail = function(email) {
        return $http.get(WB_CONFIG.SERVIDOR + "/consultarUsuarioPorEmail?email=" + email);
    };
    
    this.autenticarUsuario = function(usuario) {
        var senhaEncriptada = CryptoJS.SHA256(usuario.senha).toString();
        return $http.get(WB_CONFIG.SERVIDOR + "/autenticarUsuario?email=" + usuario.email + "&senha=" + senhaEncriptada);
    };
    
    this.atualizarIdPushUsuario = function(email, idpush) {
      var consultarUsuario = function(email, idpush) {
        return $http.get(WB_CONFIG.SERVIDOR + "/consultarUsuarioPorEmail?email=" + email).then(function(response){
          return {id: response.data, email: email, idpush: idpush};
        });
      }, atualizarUsuario = function(usuario) {
        var data = {
          "_method": 'put',
          "usuario": usuario
        };
        return $http.put(WB_CONFIG.SERVIDOR + "/usuarios/" + data.usuario.id + ".json", data).then(function(response){
          return response;
        });
      };
      
      return consultarUsuario(email, idpush).then(atualizarUsuario);
    };
    
    this.cadastrarUsuario = function(usuario) {
      usuario.senha = CryptoJS.SHA256(usuario.senha).toString();
      var data = {
        usuario: usuario
      };
      return $http.post(WB_CONFIG.SERVIDOR + "/usuarios.json", data);
    };
    
    this.atualizarSenhaUsuario = function(usuario) {
      var consultarUsuario = function(email, senha) {
        return $http.get(WB_CONFIG.SERVIDOR + "/consultarUsuarioPorEmail?email=" + email).then(function(response){
          return {id: response.data, email: email, senha: senha};
        });
      }, atualizarUsuario = function(usuario) {
        var data = {
          "_method": 'put',
          "usuario": usuario
        };
        return $http.put(WB_CONFIG.SERVIDOR + "/usuarios/" + data.usuario.id + ".json", data).then(function(response){
          return response;
        });
      };
      
      usuario.senha = CryptoJS.SHA256(usuario.senha).toString();
      return consultarUsuario(usuario.email, usuario.senha).then(atualizarUsuario);
    };
    
    this.enviarEmailRecuperaSenha = function(email, codigo) {
      return $http.get(WB_CONFIG.SERVIDOR + "/enviarEmailRecuperacaoSenha?email=" + email + "&codigo=" + codigo);
    };
});