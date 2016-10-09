

//Database instance
var db = null;

angular.module('app', ['ionic','ngCordova','ngMessages','app.controllers','app.routes','app.factory','ionic-datepicker','ui.mask','ionic-timepicker'])


.run(function($ionicPlatform, $cordovaSQLite) {

  $ionicPlatform.ready(function() {
    
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

    db = $cordovaSQLite.openDB({ name: "allremeber.db", location: 'default' });
    
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS lembrancas(lembranca text, descricao text)");
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS usuarios(nome text, senha text)");
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS alergias(nome text, descricao text)");
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS eventos(nome text, data text, hora text, local text, minutosAntesDoEvento integer)");
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS historico(descricao text)");
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS dadosPaciente(fotoURI text, nome text, sexo text, dataNascimento text, estagioAlzheimer text)");
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS contatos(nome text, endereco text, CEP text, bairro text, cidade text, celular text, responsavel text, cuidador text, fotoURI text)");
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS dicas(nome text, link text)");
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS doencas(nome text, diagnosticadaEm text, estagio text, sintomas text, medicacoes text)");
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS medicos(nome text, especialidade text, telefone text, email text, fotoURI text)");
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS medicamentos(nome text, fazUsoDesde text, dose text, horarios text, alarme text)");

  });

})



.config(function (ionicDatePickerProvider) {
    var datePickerObj = {
      inputDate: new Date(),
      setLabel: 'Selecionar',
      todayLabel: 'Hoje',
      closeLabel: 'Fechar',
      mondayFirst: false,
      //weeksList: ["S", "M", "T", "W", "T", "F", "S"],
      weeksList: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"],
      //monthsList: ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"],
      monthsList: ["Jan", "Fev", "Mar", "Abr", "Maio", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
      templateType: 'popup',
      //templateType: 'modal',
      //from: new Date(2012, 8, 1),
      //from: new Date(),
      //to: new Date(2018, 8, 1),
      showTodayButton: false,
      dateFormat: 'dd MMMM yyyy',
      closeOnSelect: true,
      disableWeekdays: []
    };
    ionicDatePickerProvider.configDatePicker(datePickerObj);
  })


.config(function (ionicTimePickerProvider) {
    var timePickerObj = {
      inputTime: (((new Date()).getHours() * 60 * 60) + ((new Date()).getMinutes() * 60)),
      format: 24,
      step: 1,
      setLabel: 'Selecionar',
      closeLabel: 'Fechar'
    };
    ionicTimePickerProvider.configTimePicker(timePickerObj);
  })

.config(function($cordovaInAppBrowserProvider) {

  var defaultOptions = {
    location: 'no',
    clearcache: 'no',
    toolbar: 'no'
  };

  $cordovaInAppBrowserProvider.setDefaultOptions(defaultOptions);

})

///Documentacao dos componentes
//https://github.com/angular-ui/ui-mask
//https://github.com/rajeshwarpatlolla/ionic-datepicker
//https://github.com/rajeshwarpatlolla/ionic-timepicker
//https://www.sqlite.org/datatype3.html
//http://www.hipsterlogogenerator.com/