angular.module('app.controllers', [])

  .controller('paginaInicialCtrl', ['$scope', '$rootScope', '$stateParams', '$state', 'usuarioFactory',
    function ($scope, $rootScope, $stateParams, $state, usuarioFactory) {

      $scope.entrar = function () {
        //define que o tipo de acesso é de paciente
        usuarioFactory.setarTipoDeAcesso("p");
        usuarioFactory.setarNome('');
        $state.go('menu.home', {});
      }

    }])

  .controller('loginCtrl', ['$scope', '$rootScope', '$stateParams', '$state', '$cordovaSQLite', 'usuarioFactory',
    function ($scope, $rootScope, $stateParams, $state, $cordovaSQLite, usuarioFactory) {

      $scope.login = {
        nome: '',
        senha: '',
        usuarioInvalido: false
      };
      $scope.originForm = angular.copy($scope.login);


      $scope.limpar = function () {
        $scope.login = angular.copy($scope.originForm);
        $state.go('paginaInicial', {});
      };

      $scope.entrar = function () {

        //Verificar se o usuário e senha estao corretos
        console.log($scope.login.nome);

        var queryFind = "select * from usuarios where nome = ? and senha = ?";
        $cordovaSQLite.execute(db, queryFind, [$scope.login.nome, $scope.login.senha]).then(function (result) {

          //se sim, enviar para a tela HOME e seta o usuario como cuidador
          if (result.rows.length > 0) {
            //limpa a define que o tipo de acesso é de cuidador
            $scope.login = angular.copy($scope.originForm);
            usuarioFactory.setarTipoDeAcesso("c");
            usuarioFactory.setarNome(result.rows.item(0).nome);
            $state.go('menu.home', {});
          } else {
            //se não, mostra mensagem de usuario invalido
            $scope.login.usuarioInvalido = true;
          }


        }, function (error) {
          console.log(JSON.stringify(error));
        });


      };

    }])

  .controller('signupCtrl', ['$scope', '$stateParams', '$state', '$cordovaSQLite',
    function ($scope, $stateParams, $state, $cordovaSQLite) {


      $scope.perfil = {
        nome: '',
        senha: '',
        usuarioEmUso: false
      };
      $scope.originForm = angular.copy($scope.perfil);

      $scope.limpar = function () {
        $scope.perfil = angular.copy($scope.originForm);
        $state.go('paginaInicial', {});
      };


      $scope.gravar = function () {
        //Verificar se o usuário existe
        var queryFind = "select 1 from usuarios where nome = ?";
        $cordovaSQLite.execute(db, queryFind, [$scope.perfil.nome]).then(function (result) {

          if (result.rows.length > 0) {
            //se sim, mostrar mensagem e limpar a tela 
            $scope.perfil = angular.copy($scope.originForm);
            $scope.perfil.usuarioEmUso = true;
          } else {

            var query = "insert into usuarios(nome, senha) values (?,?)";
            $cordovaSQLite.execute(db, query, [$scope.perfil.nome, $scope.perfil.senha]).then(function (error) {
              console.log(JSON.stringify(error));
            });
            $scope.perfil = angular.copy($scope.originForm);
            $state.go('login', {});

          }

        }, function (error) {
          console.log(JSON.stringify(error));
        });

      };


    }])

  //home
  .controller('homeCtrl', ['$scope', '$stateParams', '$state', '$rootScope', 'usuarioFactory',
    function ($scope, $stateParams, $state, $rootScope, usuarioFactory) {

      $scope.nome = usuarioFactory.pegarNome();
      $rootScope.$on("updates", function () {
         $scope.nome = usuarioFactory.pegarNome();
      });
      
      var dataAtual = new Date();
      var hour = dataAtual.getHours();
      var minutes = dataAtual.getMinutes();
      if (hour.toString().length == 1) {
        hour = "0" + hour;
      }
      if (minutes.toString().length == 1) {
        minutes = "0" + minutes;
      }
      if (hour > 17 || hour < 6){
        $scope.periodo = "noite";
      }else{
        $scope.periodo = "dia";
      }


      $scope.ano = dataAtual.getFullYear();
      $scope.mes = dataAtual.getMonth()+1;
      $scope.dia = dataAtual.getDate();


      $scope.horas = hour + ':' + minutes;
      $scope.evento = usuarioFactory.ProximoEvento();



  }])

  //Alergias
  .controller('alergiasListaCtrl', ['$scope', '$stateParams', '$state', 'AlergiaFactory', '$rootScope', 'usuarioFactory',
    function ($scope, $stateParams, $state, AlergiaFactory, $rootScope, usuarioFactory) {



      $scope.isPaciente = ('p' == usuarioFactory.pegarTipoDeAcesso());
      $rootScope.$on("updates", function () {
        $scope.isPaciente = ('p' == usuarioFactory.pegarTipoDeAcesso());
      });

      $scope.alergiasLista = AlergiaFactory.listar();

      $scope.remover = function (id) {
        AlergiaFactory.remover(id);
      }

      $scope.editar = function (id) {
        $state.go('alergiasEditar', { alergiaId: id });
      }

      $scope.adicionar = function () {
        $state.go('alergiasAdicionar', {});
      }


    }])

  .controller('alergiasAdicionarCtrl', ['$scope', '$stateParams', '$state', 'AlergiaFactory',
    function ($scope, $stateParams, $state, AlergiaFactory) {

      $scope.alergia = {
        nome: '',
        descricao: ''
      };
      $scope.originForm = angular.copy($scope.alergia);

      $scope.limpar = function () {
        $scope.alergia = angular.copy($scope.originForm);
        $state.go('menu.alergiasLista', {});
      }

      $scope.gravar = function () {
        AlergiaFactory.adicionar($scope.alergia);
        $scope.alergia = angular.copy($scope.originForm);
        $state.go('menu.alergiasLista', {});
      }


    }])

  .controller('alergiasEditarCtrl', ['$scope', '$stateParams', '$state', 'AlergiaFactory', '$rootScope', 'usuarioFactory',
    function ($scope, $stateParams, $state, AlergiaFactory, $rootScope, usuarioFactory) {


      $scope.isPaciente = ('p' == usuarioFactory.pegarTipoDeAcesso());
      $rootScope.$on("updates", function () {
        $scope.isPaciente = ('p' == usuarioFactory.pegarTipoDeAcesso());
      });

      $scope.alergia = angular.copy(AlergiaFactory.pegarPorId($state.params.alergiaId));

      $scope.limpar = function () {
        $state.go('menu.alergiasLista', {});
      }

      $scope.gravar = function () {
        AlergiaFactory.editar($scope.alergia);
        $state.go('menu.alergiasLista', {});
      }


    }])
  ///FimAlergias

  //Eventos
  .controller('eventosListaCtrl', ['$scope', '$stateParams', '$state', '$rootScope', 'usuarioFactory', 'EventoFactory',
    function ($scope, $stateParams, $state, $rootScope, usuarioFactory, EventoFactory) {

      $scope.isPaciente = ('p' == usuarioFactory.pegarTipoDeAcesso());
      $rootScope.$on("updates", function () {
        $scope.isPaciente = ('p' == usuarioFactory.pegarTipoDeAcesso());
      });

      $scope.eventosLista = EventoFactory.listar();

      $scope.remover = function (id) {
        EventoFactory.remover(id);
      }

      $scope.editar = function (id) {
        $state.go('eventosEditar', { eventoId: id });
      }

      $scope.adicionar = function () {
        $state.go('eventosAdicionar', {});
      }


    }])

  .controller('eventosAdicionarCtrl', ['$scope', '$stateParams', '$state', 'EventoFactory', 'ionicDatePicker', 'ionicTimePicker', '$ionicPopup',
    function ($scope, $stateParams, $state, EventoFactory, ionicDatePicker, ionicTimePicker, $ionicPopup) {

      $scope.evento = {
        nome: '',
        data: '__/__/____',
        hora: '__:__',
        local: '',
        minutosAntesDoEvento: 0
      };

      $scope.originForm = angular.copy($scope.evento);

      $scope.limpar = function () {
        $scope.evento = angular.copy($scope.originForm);
        $state.go('menu.eventosLista', {});
      }

      $scope.gravar = function () {

        var dataAtual = new Date();

        var _data = $scope.evento.data.split("/");
        var _horaMinutos = $scope.evento.hora.split(":");
        var _ano = _data[2];
        var _mes = _data[1] - 1;
        var _dia = _data[0];
        var _hora = _horaMinutos[0];
        var _minutos = _horaMinutos[1];
        var dataSelecao = new Date(_ano, _mes, _dia, _hora, _minutos, 0, 0);

        if (dataAtual.getTime() > dataSelecao.getTime()) {
          $ionicPopup.alert({
            title: 'Alerta!',
            template: 'Data e horário não pode ser inferior ao horário atual.'
          }).then(function (res) { });
        } else {
          EventoFactory.adicionar($scope.evento);
          $scope.evento = angular.copy($scope.originForm);
          $state.go('menu.eventosLista', {});
        }


      }

      //datepicker
      var datePickerConfig = {
        callback: function (val) {
          //formata a data para apresentar no input
          var data = new Date(val);
          var dia = data.getDate();
          if (dia.toString().length == 1)
            dia = "0" + dia;
          var mes = data.getMonth() + 1;
          if (mes.toString().length == 1)
            mes = "0" + mes;
          var ano = data.getFullYear();
          $scope.evento.data = dia + "/" + mes + "/" + ano;
        },
        from: new Date(),
      };

      $scope.openDatePicker = function () {
        ionicDatePicker.openDatePicker(datePickerConfig);
      };



      //timepiker
      var ipObj1 = {
        callback: function (val) {
          if (typeof (val) === 'undefined') {
            console.log('Time not selected');
          } else {
            var selectedTime = new Date(val * 1000);
            var hour = selectedTime.getUTCHours();
            var minutes = selectedTime.getUTCMinutes();
            if (hour.toString().length == 1) {
              hour = "0" + hour;
            }
            if (minutes.toString().length == 1) {
              minutes = "0" + minutes;
            }

            $scope.evento.hora = hour + ':' + minutes;
          }
        },
        inputTime: (((new Date()).getHours() * 60 * 60) + ((new Date()).getMinutes() * 60))
      };

      $scope.openTimePicker = function () {
        ionicTimePicker.openTimePicker(ipObj1);
      };

    }])

  .controller('eventosEditarCtrl', ['$scope', '$stateParams', '$state', '$rootScope', 'usuarioFactory', 'EventoFactory', 'ionicDatePicker', 'ionicTimePicker','$ionicPopup',
    function ($scope, $stateParams, $state, $rootScope, usuarioFactory, EventoFactory, ionicDatePicker, ionicTimePicker,$ionicPopup) {


      $scope.isPaciente = ('p' == usuarioFactory.pegarTipoDeAcesso());
      $rootScope.$on("updates", function () {
        $scope.isPaciente = ('p' == usuarioFactory.pegarTipoDeAcesso());
      });

      $scope.evento = angular.copy(EventoFactory.pegarPorId($state.params.eventoId));

      //datepicker
      var datePickerConfig = {
        callback: function (val) {
          //formata a data para apresentar no input
          var data = new Date(val);
          var dia = data.getDate();
          if (dia.toString().length == 1)
            dia = "0" + dia;
          var mes = data.getMonth() + 1;
          if (mes.toString().length == 1)
            mes = "0" + mes;
          var ano = data.getFullYear();
          $scope.evento.data = dia + "/" + mes + "/" + ano;
        },
        from: new Date(),
      };

      $scope.openDatePicker = function () {
        ionicDatePicker.openDatePicker(datePickerConfig);
      };

      //timepiker
      var ipObj1 = {
        callback: function (val) {
          if (typeof (val) === 'undefined') {
            console.log('Time not selected');
          } else {
            var selectedTime = new Date(val * 1000);
            var hour = selectedTime.getUTCHours();
            var minutes = selectedTime.getUTCMinutes();
            if (hour.toString().length == 1) {
              hour = "0" + hour;
            }
            if (minutes.toString().length == 1) {
              minutes = "0" + minutes;
            }

            $scope.evento.hora = hour + ':' + minutes;
          }
        }
      };

      $scope.openTimePicker = function () {
        ionicTimePicker.openTimePicker(ipObj1);
      };

      $scope.limpar = function () {
        $state.go('menu.eventosLista', {});
      }

      $scope.gravar = function () {

        var dataAtual = new Date();

        var _data = $scope.evento.data.split("/");
        var _horaMinutos = $scope.evento.hora.split(":");
        var _ano = _data[2];
        var _mes = _data[1] - 1;
        var _dia = _data[0];
        var _hora = _horaMinutos[0];
        var _minutos = _horaMinutos[1];
        var dataSelecao = new Date(_ano, _mes, _dia, _hora, _minutos, 0, 0);

        if (dataAtual.getTime() > dataSelecao.getTime()) {
          $ionicPopup.alert({
            title: 'Alerta!',
            template: 'Data e horário não pode ser inferior ao horário atual.'
          }).then(function (res) { });
        } else {

          EventoFactory.editar($scope.evento);
          $state.go('menu.eventosLista', {});

        }
      }

    }])
  ///FimEventos    

  //Diario
  .controller('lembrancasListaCtrl', ['$scope', '$stateParams', '$state', 'LembrancaFactory', '$rootScope', 'usuarioFactory',
    function ($scope, $stateParams, $state, LembrancaFactory, $rootScope, usuarioFactory) {



      $scope.isPaciente = ('p' == usuarioFactory.pegarTipoDeAcesso());
      $rootScope.$on("updates", function () {
        $scope.isPaciente = ('p' == usuarioFactory.pegarTipoDeAcesso());
      });

      $scope.lembrancasLista = LembrancaFactory.listar();

      $scope.remover = function (id) {
        LembrancaFactory.remover(id);
      }

      $scope.editar = function (id) {
        $state.go('lembrancasEditar', { lembrancaId: id });
      }

      $scope.adicionar = function () {
        $state.go('lembrancasAdicionar', {});
      }


    }])

  .controller('lembrancasAdicionarCtrl', ['$scope', '$stateParams', '$state', 'LembrancaFactory',
    function ($scope, $stateParams, $state, LembrancaFactory) {

      $scope.lembranca = {
        lembranca: '',
        descricao: ''
      };
      $scope.originForm = angular.copy($scope.lembranca);

      $scope.limpar = function () {
        $scope.lembranca = angular.copy($scope.originForm);
        $state.go('menu.lembrancasLista', {});
      }

      $scope.gravar = function () {
        LembrancaFactory.adicionar($scope.lembranca);
        $scope.lembranca = angular.copy($scope.originForm);
        $state.go('menu.lembrancasLista', {});
      }


    }])

  .controller('lembrancasEditarCtrl', ['$scope', '$stateParams', '$state', 'LembrancaFactory', '$rootScope', 'usuarioFactory',
    function ($scope, $stateParams, $state, LembrancaFactory, $rootScope, usuarioFactory) {


      $scope.isPaciente = ('p' == usuarioFactory.pegarTipoDeAcesso());
      $rootScope.$on("updates", function () {
        $scope.isPaciente = ('p' == usuarioFactory.pegarTipoDeAcesso());
      });

      console.log($state.params.lembrancaId);
      $scope.lembranca = angular.copy(LembrancaFactory.pegarPorId($state.params.lembrancaId));

      $scope.limpar = function () {
        $state.go('menu.lembrancasLista', {});
      }

      $scope.gravar = function () {
        LembrancaFactory.editar($scope.lembranca);
        $state.go('menu.lembrancasLista', {});
      }


    }])
  //FimDiario

  //Historico
  .controller('historicoCtrl', ['$scope', '$stateParams', '$state', 'HistoricoFactory', '$rootScope', 'usuarioFactory','$ionicPopup',
    function ($scope, $stateParams, $state, HistoricoFactory, $rootScope, usuarioFactory, $ionicPopup) {


      $scope.historico = HistoricoFactory.carregar();

      $scope.isPaciente = ('p' == usuarioFactory.pegarTipoDeAcesso());
      $rootScope.$on("updates", function () {
        $scope.isPaciente = ('p' == usuarioFactory.pegarTipoDeAcesso());
      });


      $scope.gravar = function () {
        HistoricoFactory.adicionar($scope.historico);
        $ionicPopup.alert({
                title: 'Informação!',
                template: 'Gravado com Sucesso!'
        }).then(function (res) { });


      }


    }])

  //Dados Paciente
  .controller('dadosPacienteCtrl', ['$scope', '$stateParams', '$state', 'DadosPacienteFactory', '$rootScope', 'usuarioFactory', 'ionicDatePicker', '$cordovaCamera','$ionicPopup',
    function ($scope, $stateParams, $state, DadosPacienteFactory, $rootScope, usuarioFactory, ionicDatePicker, $cordovaCamera, $ionicPopup) {

      $scope.estagiosDoenca = [
        { id: 0, nome: 'Inicial' },
        { id: 1, nome: 'Intermediário' },
        { id: 2, nome: 'Avançado' }
      ]

      $scope.dadosPaciente = DadosPacienteFactory.carregar();

      $scope.isPaciente = ('p' == usuarioFactory.pegarTipoDeAcesso());
      $rootScope.$on("updates", function () {
        $scope.isPaciente = ('p' == usuarioFactory.pegarTipoDeAcesso());
      });

      $scope.gravar = function () {

        var dadosForSave = {
          id: $scope.dadosPaciente.id,
          fotoURI: $scope.dadosPaciente.fotoURI,
          nome: $scope.dadosPaciente.nome,
          sexo: $scope.dadosPaciente.sexo,
          dataNascimento: $scope.dadosPaciente.dataNascimento,
          estagioAlzheimer: $scope.dadosPaciente.estagioAlzheimer.nome
        }

        DadosPacienteFactory.adicionar(dadosForSave);

        $ionicPopup.alert({
                title: 'Informação!',
                template: 'Gravado com Sucesso!'
        }).then(function (res) { });

      }

      //datepicker
      var datePickerConfig = {
        callback: function (val) {
          //formata a data para apresentar no input
          var data = new Date(val);
          var dia = data.getDate();
          if (dia.toString().length == 1)
            dia = "0" + dia;
          var mes = data.getMonth() + 1;
          if (mes.toString().length == 1)
            mes = "0" + mes;
          var ano = data.getFullYear();
          $scope.dadosPaciente.dataNascimento = dia + "/" + mes + "/" + ano;
        }
      };

      $scope.openDatePicker = function () {
        ionicDatePicker.openDatePicker(datePickerConfig);
      };

      $scope.TirarFoto = function () {


        var options = {
          quality: 50,
          destinationType: Camera.DestinationType.DATA_URL,
          sourceType: Camera.PictureSourceType.CAMERA,
          allowEdit: true,
          encodingType: Camera.EncodingType.JPEG,
          targetWidth: 100,
          targetHeight: 100,
          popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: true,
          correctOrientation: true
        };

        $cordovaCamera.getPicture(options).then(function (imageURI) {
          $scope.dadosPaciente.fotoURI = "data:image/jpeg;base64," + imageURI;
        }, function (err) {
          // error
        });

      }


    }])

  //Contatos
  .controller('contatosListaCtrl', ['$scope', '$stateParams', '$state', 'ContatoFactory', '$rootScope', 'usuarioFactory',
    function ($scope, $stateParams, $state, ContatoFactory, $rootScope, usuarioFactory) {



      $scope.isPaciente = ('p' == usuarioFactory.pegarTipoDeAcesso());
      $rootScope.$on("updates", function () {
        $scope.isPaciente = ('p' == usuarioFactory.pegarTipoDeAcesso());
      });

      $scope.contatosLista = ContatoFactory.listar();

      $scope.remover = function (id) {
        ContatoFactory.remover(id);
      }

      $scope.editar = function (id) {
        $state.go('contatosEditar', { contatoId: id });
      }

      $scope.adicionar = function () {
        $state.go('contatosAdicionar', {});
      }


    }])

  .controller('contatosAdicionarCtrl', ['$scope', '$stateParams', '$state', 'ContatoFactory', '$cordovaCamera',
    function ($scope, $stateParams, $state, ContatoFactory, $cordovaCamera) {

      $scope.contato = {
        nome: '',
        endereco: '',
        CEP: null,
        bairro: '',
        cidade: '',
        celular: null,
        responsavel: false,
        cuidador: false,
        fotoURI: 'img/avatar.png'
      };
      $scope.originForm = angular.copy($scope.contato);

      $scope.limpar = function () {
        $scope.contato = angular.copy($scope.originForm);
        $state.go('menu.contatosLista', {});
      }

      $scope.gravar = function () {
        ContatoFactory.adicionar($scope.contato);
        $scope.contato = angular.copy($scope.originForm);
        $state.go('menu.contatosLista', {});
      }


      $scope.TirarFoto = function () {


        var options = {
          quality: 50,
          destinationType: Camera.DestinationType.DATA_URL,
          sourceType: Camera.PictureSourceType.CAMERA,
          allowEdit: true,
          encodingType: Camera.EncodingType.JPEG,
          targetWidth: 100,
          targetHeight: 100,
          popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: true,
          correctOrientation: true
        };

        $cordovaCamera.getPicture(options).then(function (imageURI) {
          $scope.contato.fotoURI = "data:image/jpeg;base64," + imageURI;
        }, function (err) {
          // error
        });

      }

    }])

  .controller('contatosEditarCtrl', ['$scope', '$stateParams', '$state', 'ContatoFactory', '$rootScope', 'usuarioFactory', '$cordovaCamera',
    function ($scope, $stateParams, $state, ContatoFactory, $rootScope, usuarioFactory, $cordovaCamera) {


      $scope.isPaciente = ('p' == usuarioFactory.pegarTipoDeAcesso());
      $rootScope.$on("updates", function () {
        $scope.isPaciente = ('p' == usuarioFactory.pegarTipoDeAcesso());
      });

      $scope.contato = angular.copy(ContatoFactory.pegarPorId($state.params.contatoId));
      console.log(JSON.stringify($scope.contato, null, 4));

      $scope.limpar = function () {
        $state.go('menu.contatosLista', {});
      }

      $scope.gravar = function () {
        ContatoFactory.editar($scope.contato);
        $state.go('menu.contatosLista', {});
      }

      $scope.TirarFoto = function () {


        var options = {
          quality: 50,
          destinationType: Camera.DestinationType.DATA_URL,
          sourceType: Camera.PictureSourceType.CAMERA,
          allowEdit: true,
          encodingType: Camera.EncodingType.JPEG,
          targetWidth: 100,
          targetHeight: 100,
          popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: true,
          correctOrientation: true
        };

        $cordovaCamera.getPicture(options).then(function (imageURI) {
          $scope.contato.fotoURI = "data:image/jpeg;base64," + imageURI;
        }, function (err) {
          // error
        });

      }

    }])
  ///FimContatos

  ///Dicas
  .controller('dicasListaCtrl', ['$scope', '$stateParams', '$state', 'DicaFactory', '$rootScope', 'usuarioFactory', '$cordovaInAppBrowser',
    function ($scope, $stateParams, $state, DicaFactory, $rootScope, usuarioFactory, $cordovaInAppBrowser) {


      $scope.isPaciente = ('p' == usuarioFactory.pegarTipoDeAcesso());
      $rootScope.$on("updates", function () {
        $scope.isPaciente = ('p' == usuarioFactory.pegarTipoDeAcesso());
      });

      $scope.dicasLista = DicaFactory.listar();

      $scope.remover = function (id) {
        DicaFactory.remover(id);
      }

      $scope.editar = function (id) {
        $state.go('dicasEditar', { dicaId: id });
      }

      $scope.adicionar = function () {
        $state.go('dicasAdicionar', {});
      }

      $scope.abrirPage = function (link) {


        console.log('teste :' + link);

        var options = {
          location: 'no',
          clearcache: 'yes',
          toolbar: 'yes'
        };

        $cordovaInAppBrowser.open(link, '_blank', options)
          .then(function (event) {
            // success
          })
          .catch(function (event) {
            // error
          });

      }


    }])

  .controller('dicasAdicionarCtrl', ['$scope', '$stateParams', '$state', 'DicaFactory',
    function ($scope, $stateParams, $state, DicaFactory) {

      $scope.dica = {
        nome: '',
        link: ''
      };
      $scope.originForm = angular.copy($scope.dica);

      $scope.limpar = function () {
        $scope.dica = angular.copy($scope.originForm);
        $state.go('menu.dicasLista', {});
      }

      $scope.gravar = function () {
        DicaFactory.adicionar($scope.dica);
        $scope.dica = angular.copy($scope.originForm);
        $state.go('menu.dicasLista', {});
      }


    }])

  .controller('dicasEditarCtrl', ['$scope', '$stateParams', '$state', 'DicaFactory', '$rootScope', 'usuarioFactory',
    function ($scope, $stateParams, $state, DicaFactory, $rootScope, usuarioFactory) {


      $scope.isPaciente = ('p' == usuarioFactory.pegarTipoDeAcesso());
      $rootScope.$on("updates", function () {
        $scope.isPaciente = ('p' == usuarioFactory.pegarTipoDeAcesso());
      });

      $scope.dica = angular.copy(DicaFactory.pegarPorId($state.params.dicaId));

      $scope.limpar = function () {
        $state.go('menu.dicasLista', {});
      }

      $scope.gravar = function () {
        DicaFactory.editar($scope.dica);
        $state.go('menu.dicasLista', {});
      }


    }])

  ///FimDicas


  ///Doencas
  .controller('doencasListaCtrl', ['$scope', '$stateParams', '$state', 'DoencaFactory', '$rootScope', 'usuarioFactory',
    function ($scope, $stateParams, $state, DoencaFactory, $rootScope, usuarioFactory) {


      $scope.isPaciente = ('p' == usuarioFactory.pegarTipoDeAcesso());
      $rootScope.$on("updates", function () {
        $scope.isPaciente = ('p' == usuarioFactory.pegarTipoDeAcesso());
      });

      $scope.doencasLista = DoencaFactory.listar();

      $scope.remover = function (id) {
        DoencaFactory.remover(id);
      }

      $scope.editar = function (id) {
        $state.go('doencasEditar', { doencaId: id });
      }

      $scope.adicionar = function () {
        $state.go('doencasAdicionar', {});
      }



    }])

  .controller('doencasAdicionarCtrl', ['$scope', '$stateParams', '$state', 'DoencaFactory', 'ionicDatePicker',
    function ($scope, $stateParams, $state, DoencaFactory, ionicDatePicker) {

      $scope.estagiosDoenca = [
        { id: 0, nome: 'Inicial' },
        { id: 1, nome: 'Intermediário' },
        { id: 2, nome: 'Avançado' }
      ]

      $scope.doenca = {
        nome: '',
        diagnosticadaEm: '__/__/____',
        estagio: { id: 0, nome: 'Inicial' },
        sintomas: '',
        medicacoes: ''
      };
      $scope.originForm = angular.copy($scope.doenca);

      $scope.limpar = function () {
        $scope.doenca = angular.copy($scope.originForm);
        $state.go('menu.doencasLista', {});
      }

      $scope.gravar = function () {

        var doencaForSave = {
          nome: $scope.doenca.nome,
          diagnosticadaEm: $scope.doenca.diagnosticadaEm,
          estagio: $scope.doenca.estagio.nome,
          sintomas: $scope.doenca.sintomas,
          medicacoes: $scope.doenca.medicacoes
        }

        DoencaFactory.adicionar(doencaForSave);
        $scope.doenca = angular.copy($scope.originForm);
        $state.go('menu.doencasLista', {});
      }

      //datepicker
      var datePickerConfig = {
        callback: function (val) {
          //formata a data para apresentar no input
          var data = new Date(val);
          var dia = data.getDate();
          if (dia.toString().length == 1)
            dia = "0" + dia;
          var mes = data.getMonth() + 1;
          if (mes.toString().length == 1)
            mes = "0" + mes;
          var ano = data.getFullYear();
          $scope.doenca.diagnosticadaEm = dia + "/" + mes + "/" + ano;
        }
      };

      $scope.openDatePicker = function () {
        ionicDatePicker.openDatePicker(datePickerConfig);
      };


    }])

  .controller('doencasEditarCtrl', ['$scope', '$stateParams', '$state', 'DoencaFactory', '$rootScope', 'usuarioFactory', 'ionicDatePicker',
    function ($scope, $stateParams, $state, DoencaFactory, $rootScope, usuarioFactory, ionicDatePicker) {


      $scope.isPaciente = ('p' == usuarioFactory.pegarTipoDeAcesso());
      $rootScope.$on("updates", function () {
        $scope.isPaciente = ('p' == usuarioFactory.pegarTipoDeAcesso());
      });

      $scope.estagiosDoenca = [
        { id: 0, nome: 'Inicial' },
        { id: 1, nome: 'Intermediário' },
        { id: 2, nome: 'Avançado' }
      ]

      $scope.doenca = angular.copy(DoencaFactory.pegarPorId($state.params.doencaId));

      console.log(JSON.stringify($scope.doenca, null, 4));

      $scope.limpar = function () {
        $state.go('menu.doencasLista', {});
      }

      $scope.gravar = function () {

        var doencaForSave = {
          id: $scope.doenca.id,
          nome: $scope.doenca.nome,
          diagnosticadaEm: $scope.doenca.diagnosticadaEm,
          estagio: $scope.doenca.estagio.nome,
          sintomas: $scope.doenca.sintomas,
          medicacoes: $scope.doenca.medicacoes
        }

        DoencaFactory.editar(doencaForSave);
        $state.go('menu.doencasLista', {});
      }

      //datepicker
      var datePickerConfig = {
        callback: function (val) {
          //formata a data para apresentar no input
          var data = new Date(val);
          var dia = data.getDate();
          if (dia.toString().length == 1)
            dia = "0" + dia;
          var mes = data.getMonth() + 1;
          if (mes.toString().length == 1)
            mes = "0" + mes;
          var ano = data.getFullYear();
          $scope.doenca.diagnosticadaEm = dia + "/" + mes + "/" + ano;
        }
      };

      $scope.openDatePicker = function () {
        ionicDatePicker.openDatePicker(datePickerConfig);
      };

    }])
  ///Fim Doencas

  ///Medicos
  .controller('medicosListaCtrl', ['$scope', '$stateParams', '$state', 'MedicoFactory', '$rootScope', 'usuarioFactory',
    function ($scope, $stateParams, $state, MedicoFactory, $rootScope, usuarioFactory) {


      $scope.isPaciente = ('p' == usuarioFactory.pegarTipoDeAcesso());
      $rootScope.$on("updates", function () {
        $scope.isPaciente = ('p' == usuarioFactory.pegarTipoDeAcesso());
      });

      $scope.medicosLista = MedicoFactory.listar();

      $scope.remover = function (id) {
        MedicoFactory.remover(id);
      }

      $scope.editar = function (id) {
        $state.go('medicosEditar', { medicoId: id });
      }

      $scope.adicionar = function () {
        $state.go('medicosAdicionar', {});
      }

    }])

  .controller('medicosAdicionarCtrl', ['$scope', '$stateParams', '$state', 'MedicoFactory', '$cordovaCamera',
    function ($scope, $stateParams, $state, MedicoFactory, $cordovaCamera) {

      $scope.medico = {
        nome: '',
        especialidade: '',
        telefone: '',
        email: '',
        fotoURI: 'img/avatar.png',
      };
      $scope.originForm = angular.copy($scope.medico);

      $scope.limpar = function () {
        $scope.medico = angular.copy($scope.originForm);
        $state.go('menu.medicosLista', {});
      }

      $scope.gravar = function () {
        MedicoFactory.adicionar($scope.medico);
        $scope.medico = angular.copy($scope.originForm);
        $state.go('menu.medicosLista', {});
      }

      $scope.TirarFoto = function () {


        var options = {
          quality: 50,
          destinationType: Camera.DestinationType.DATA_URL,
          sourceType: Camera.PictureSourceType.CAMERA,
          allowEdit: true,
          encodingType: Camera.EncodingType.JPEG,
          targetWidth: 100,
          targetHeight: 100,
          popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: true,
          correctOrientation: true
        };

        $cordovaCamera.getPicture(options).then(function (imageURI) {
          $scope.medico.fotoURI = "data:image/jpeg;base64," + imageURI;
        }, function (err) {
          // error
        });

      }

    }])

  .controller('medicosEditarCtrl', ['$scope', '$stateParams', '$state', 'MedicoFactory', '$rootScope', 'usuarioFactory', '$cordovaCamera',
    function ($scope, $stateParams, $state, MedicoFactory, $rootScope, usuarioFactory, $cordovaCamera) {


      $scope.isPaciente = ('p' == usuarioFactory.pegarTipoDeAcesso());
      $rootScope.$on("updates", function () {
        $scope.isPaciente = ('p' == usuarioFactory.pegarTipoDeAcesso());
      });

      $scope.medico = angular.copy(MedicoFactory.pegarPorId($state.params.medicoId));

      $scope.limpar = function () {
        $state.go('menu.medicosLista', {});
      }

      $scope.gravar = function () {
        MedicoFactory.editar($scope.medico);
        $state.go('menu.medicosLista', {});
      }

      $scope.TirarFoto = function () {


        var options = {
          quality: 50,
          destinationType: Camera.DestinationType.DATA_URL,
          sourceType: Camera.PictureSourceType.CAMERA,
          allowEdit: true,
          encodingType: Camera.EncodingType.JPEG,
          targetWidth: 100,
          targetHeight: 100,
          popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: true,
          correctOrientation: true
        };

        $cordovaCamera.getPicture(options).then(function (imageURI) {
          $scope.medico.fotoURI = "data:image/jpeg;base64," + imageURI;
        }, function (err) {
          // error
        });

      }

    }])
  ///Fim Medicos

  ///Medicamentos
  .controller('medicamentosListaCtrl', ['$scope', '$stateParams', '$state', 'MedicamentoFactory', '$rootScope', 'usuarioFactory',
    function ($scope, $stateParams, $state, MedicamentoFactory, $rootScope, usuarioFactory) {


      $scope.isPaciente = ('p' == usuarioFactory.pegarTipoDeAcesso());
      $rootScope.$on("updates", function () {
        $scope.isPaciente = ('p' == usuarioFactory.pegarTipoDeAcesso());
      });

      $scope.medicamentosLista = MedicamentoFactory.listar();

      $scope.remover = function (id) {
        MedicamentoFactory.remover(id);
      }

      $scope.editar = function (id) {
        $state.go('medicamentosEditar', { medicamentoId: id });
      }

      $scope.adicionar = function () {
        $state.go('medicamentosAdicionar', {});
      }

    }])

  .controller('medicamentosAdicionarCtrl', ['$scope', '$stateParams', '$state', 'MedicamentoFactory', 'ionicDatePicker', 'ionicTimePicker', '$ionicPopup',
    function ($scope, $stateParams, $state, MedicamentoFactory, ionicDatePicker, ionicTimePicker, $ionicPopup) {

      $scope.medicamento = {
        nome: '',
        fazUsoDesde: '__/__/____',
        dose: '',
        alarme: '',
        horarios: []
      };

      $scope.originForm = angular.copy($scope.medicamento);

      $scope.limpar = function () {
        $scope.medicamento = angular.copy($scope.originForm);
        $state.go('menu.medicamentosLista', {});
      }

      $scope.gravar = function () {
        MedicamentoFactory.adicionar($scope.medicamento);
        $scope.medicamento = angular.copy($scope.originForm);
        $state.go('menu.medicamentosLista', {});
      }

      //datepicker
      var datePickerConfig = {
        callback: function (val) {
          //formata a data para apresentar no input
          var data = new Date(val);
          var dia = data.getDate();
          if (dia.toString().length == 1)
            dia = "0" + dia;
          var mes = data.getMonth() + 1;
          if (mes.toString().length == 1)
            mes = "0" + mes;
          var ano = data.getFullYear();
          $scope.medicamento.fazUsoDesde = dia + "/" + mes + "/" + ano;
        }
      };

      $scope.openDatePicker = function () {
        ionicDatePicker.openDatePicker(datePickerConfig);
      };

      //timepiker
      var ipObj1 = {
        callback: function (val) {
          if (typeof (val) === 'undefined') {
            console.log('Time not selected');
          } else {
            var selectedTime = new Date(val * 1000);
            var hour = selectedTime.getUTCHours();
            var minutes = selectedTime.getUTCMinutes();
            if (hour.toString().length == 1) {
              hour = "0" + hour;
            }
            if (minutes.toString().length == 1) {
              minutes = "0" + minutes;
            }

            var hrJaEscolhido = false;

            for (var i = 0; i < $scope.medicamento.horarios.length; i++) {
              if ($scope.medicamento.horarios[i] == (hour + ':' + minutes)) {
                hrJaEscolhido = true;
              }
            }

            if (!hrJaEscolhido) {
              $scope.medicamento.horarios.push(hour + ':' + minutes);
            } else {
              $ionicPopup.alert({
                title: 'Alerta!',
                template: 'Esse horário já foi escolhido: ' + hour + ':' + minutes + ' .'
              }).then(function (res) { });
            }

          }
        },
        inputTime: (8 * 60 * 60),
        step: 30
      };
      

      $scope.openTimePicker = function () {
        ionicTimePicker.openTimePicker(ipObj1);
      };

      $scope.removeHourSelected = function (Hr) {

        for (var i = 0; i < $scope.medicamento.horarios.length; i++) {
          if (Hr == $scope.medicamento.horarios[i]) {
            $scope.medicamento.horarios.splice(i, 1);
          }
        }

      };

    }])

  .controller('medicamentosEditarCtrl', ['$scope', '$stateParams', '$state', 'MedicamentoFactory', '$rootScope', 'usuarioFactory', 'ionicDatePicker', 'ionicTimePicker', '$ionicPopup',
    function ($scope, $stateParams, $state, MedicamentoFactory, $rootScope, usuarioFactory, ionicDatePicker, ionicTimePicker, $ionicPopup) {


      $scope.isPaciente = ('p' == usuarioFactory.pegarTipoDeAcesso());
      $rootScope.$on("updates", function () {
        $scope.isPaciente = ('p' == usuarioFactory.pegarTipoDeAcesso());
      });

      $scope.medicamento = angular.copy(MedicamentoFactory.pegarPorId($state.params.medicamentoId));
      console.log(JSON.stringify($scope.medicamento, null, 4));

      $scope.limpar = function () {
        $state.go('menu.medicamentosLista', {});
      }

      $scope.gravar = function () {
        MedicamentoFactory.editar($scope.medicamento);
        $state.go('menu.medicamentosLista', {});
      }

      //datepicker
      var datePickerConfig = {
        callback: function (val) {
          //formata a data para apresentar no input
          var data = new Date(val);
          var dia = data.getDate();
          if (dia.toString().length == 1)
            dia = "0" + dia;
          var mes = data.getMonth() + 1;
          if (mes.toString().length == 1)
            mes = "0" + mes;
          var ano = data.getFullYear();
          $scope.medicamento.fazUsoDesde = dia + "/" + mes + "/" + ano;
        }
      };

      $scope.openDatePicker = function () {
        ionicDatePicker.openDatePicker(datePickerConfig);
      };

      //timepiker
      var ipObj1 = {
        callback: function (val) {
          if (typeof (val) === 'undefined') {
            console.log('Time not selected');
          } else {
            var selectedTime = new Date(val * 1000);
            var hour = selectedTime.getUTCHours();
            var minutes = selectedTime.getUTCMinutes();
            if (hour.toString().length == 1) {
              hour = "0" + hour;
            }
            if (minutes.toString().length == 1) {
              minutes = "0" + minutes;
            }

            var hrJaEscolhido = false;

            for (var i = 0; i < $scope.medicamento.horarios.length; i++) {
              if ($scope.medicamento.horarios[i] == (hour + ':' + minutes)) {
                hrJaEscolhido = true;
              }
            }

            if (!hrJaEscolhido) {
              $scope.medicamento.horarios.push(hour + ':' + minutes);
            } else {
              $ionicPopup.alert({
                title: 'Horário Incorreto!',
                template: 'Esse horário já foi escolhido: ' + hour + ':' + minutes + ' .'
              }).then(function (res) { });
            }

          }
        },
        inputTime: (8 * 60 * 60),
        step: 30
      };

      $scope.openTimePicker = function () {
        ionicTimePicker.openTimePicker(ipObj1);
      };

      $scope.removeHourSelected = function (Hr) {

        for (var i = 0; i < $scope.medicamento.horarios.length; i++) {
          if (Hr == $scope.medicamento.horarios[i]) {
            $scope.medicamento.horarios.splice(i, 1);
          }
        }

      };

    }])
  ///Fim Medicamentos