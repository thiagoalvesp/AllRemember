angular.module('app.factory', [])

    .factory('usuarioFactory', function ($cordovaSQLite, $rootScope) {

        var usuario = {};

        return {

            setarTipoDeAcesso: function (tpAcesso) {
                usuario.tipoDeAcesso = tpAcesso;
                $rootScope.$broadcast("updates");
            },


            pegarTipoDeAcesso: function () {
                return usuario.tipoDeAcesso
            },

            setarNome: function (nome) {
                if (usuario.tipoDeAcesso == 'c') {
                    usuario.nome = nome;
                    $rootScope.$broadcast("updates");
                } else {
                    var query = "select * from dadosPaciente";
                    $cordovaSQLite.execute(db, query, []).then(function (result) {
                        if (result.rows.length > 0) {
                            usuario.nome = result.rows.item(0).nome
                            $rootScope.$broadcast("updates");
                        } else {
                            usuario.nome = ""
                            $rootScope.$broadcast("updates");
                        }
                    }, function (error) {
                        console.log(JSON.stringify(error));
                    });

                }

            },


            pegarNome: function () {
                return usuario.nome
            },

            ProximoEvento: function () {



                var query = "select nome, data, hora from eventos order by data, hora ";
                $cordovaSQLite.execute(db, query, []).then(function (result) {
                    if (result.rows.length > 0) {
                        console.log(JSON.stringify(result.rows.item(0), null, 4));
                        usuario.evento = result.rows.item(0).nome
                    } else {
                        usuario.evento = 'Nenhum evento marcado!';
                    }

                }, function (error) {
                    console.log(JSON.stringify(error));
                });

                console.log(usuario.evento);
                return usuario.evento;

            }

        }

    })


    //Fim Home

    .factory('AlergiaFactory', function ($cordovaSQLite) {

        var alergias = [];

        return {

            listar: function () {

                var query = "select rowid, nome, descricao from alergias";
                $cordovaSQLite.execute(db, query, []).then(function (result) {

                    if (result.rows.length > 0) {

                        for (var i = 0; i < result.rows.length; i++) {

                            alergias.push(
                                {
                                    id: result.rows.item(i).rowid,
                                    nome: result.rows.item(i).nome,
                                    descricao: result.rows.item(i).descricao
                                }
                            )
                        }
                    }

                }, function (error) {
                    console.log(JSON.stringify(error));
                });

                return alergias;
            },


            pegarPorId: function (alergiaId) {
                for (var i = 0; i < alergias.length; i++) {
                    if (alergias[i].id == alergiaId) {
                        return alergias[i];
                    }
                }
                return undefined;
            },

            remover: function (alergiaId) {

                var query = "delete from alergias where rowid = ?";
                $cordovaSQLite.execute(db, query, [alergiaId]).then(function (result) {
                    for (var i = 0; i < alergias.length; i++) {
                        if (alergias[i].id == alergiaId) {
                            alergias.splice(i, 1);
                        }
                    }
                }, function (error) {
                    console.log(JSON.stringify(error));
                });

            },

            adicionar: function (alergia) {

                var query = "insert into alergias(nome, descricao) values (?,?)";
                $cordovaSQLite.execute(db, query, [alergia.nome, alergia.descricao]).then(function (result) {
                    alergias.push({
                        id: result.insertId,
                        nome: alergia.nome,
                        descricao: alergia.descricao
                    });
                }, function (error) {
                    console.log(JSON.stringify(error));
                });

            },

            editar: function (alergia) {

                var query = "update alergias set nome = ?, descricao = ? where rowid = ?";
                $cordovaSQLite.execute(db, query, [alergia.nome, alergia.descricao, alergia.id]).then(function (result) {

                    for (var i = 0; i < alergias.length; i++) {
                        if (alergias[i].id == alergia.id) {
                            alergias[i] = alergia;
                        }
                    }

                }, function (error) {
                    console.log(JSON.stringify(error));
                });

            }
        }

    })

    .factory('EventoFactory', function ($cordovaSQLite, $cordovaLocalNotification) {

        var eventos = [];

        return {

            listar: function () {

                var query = "select rowid, nome, data, hora, local, minutosAntesDoEvento from eventos";
                $cordovaSQLite.execute(db, query, []).then(function (result) {

                    if (result.rows.length > 0) {

                        for (var i = 0; i < result.rows.length; i++) {

                            eventos.push(
                                {
                                    id: result.rows.item(i).rowid,
                                    nome: result.rows.item(i).nome,
                                    data: result.rows.item(i).data,
                                    hora: result.rows.item(i).hora,
                                    local: result.rows.item(i).local,
                                    minutosAntesDoEvento: result.rows.item(i).minutosAntesDoEvento
                                }
                            )
                        }
                    }

                }, function (error) {
                    console.log(JSON.stringify(error));
                });

                return eventos;
            },


            pegarPorId: function (eventoId) {
                for (var i = 0; i < eventos.length; i++) {
                    if (eventos[i].id == eventoId) {
                        return eventos[i];
                    }
                }
                return undefined;
            },

            remover: function (eventoId) {

                var query = "delete from eventos where rowid = ?";
                $cordovaSQLite.execute(db, query, [eventoId]).then(function (result) {

                    //Cancelar a notificacao
                    $cordovaLocalNotification.cancel(eventoId).then(function (result) { });
                    //Atualiza a Lista
                    for (var i = 0; i < eventos.length; i++) {
                        if (eventos[i].id == eventoId) {
                            eventos.splice(i, 1);
                        }
                    }
                }, function (error) {
                    console.log(JSON.stringify(error));
                });

            },

            adicionar: function (evento) {

                var query = "insert into eventos(nome, data, hora, local, minutosAntesDoEvento) values (?,?,?,?,?)";
                $cordovaSQLite.execute(db, query, [evento.nome, evento.data, evento.hora, evento.local, evento.minutosAntesDoEvento]).then(function (result) {

                    var _data = evento.data.split("/");
                    var _horaMinutos = evento.hora.split(":");
                    var _ano = _data[2];
                    var _mes = _data[1] - 1;
                    var _dia = _data[0];

                    var _hora = _horaMinutos[0];
                    var _minutos = _horaMinutos[1];

                    var _dataNotificacao = new Date(_ano, _mes, _dia, _hora, _minutos, 0, 0);
                    var _dataNotificacao = _dataNotificacao.getTime();
                    var _dataNotificacao = new Date(_dataNotificacao - (evento.minutosAntesDoEvento * 60000));

                    //Agenda A notificao
                    $cordovaLocalNotification.schedule({
                        id: result.insertId,
                        title: 'Evento: ' + evento.nome,
                        text: 'Local: ' + evento.local + ' - Hora: ' + evento.hora,
                        at: _dataNotificacao
                    }).then(function (result) {
                        // ...
                    });


                    //Atualiza a Lista
                    eventos.push({
                        id: result.insertId,
                        nome: evento.nome,
                        data: evento.data,
                        hora: evento.hora,
                        local: evento.local,
                        minutosAntesDoEvento: evento.minutosAntesDoEvento
                    });

                }, function (error) {
                    console.log(JSON.stringify(error));
                });

            },

            editar: function (evento) {

                var query = "update eventos set nome = ?, data = ?, hora =?, local = ?, minutosAntesDoEvento = ?  where rowid = ?";
                $cordovaSQLite.execute(db, query, [evento.nome, evento.data, evento.hora, evento.local, evento.minutosAntesDoEvento, evento.id]).then(function (result) {

                    $cordovaLocalNotification.cancel(evento.id).then(function (result) { });

                    var _data = evento.data.split("/");
                    var _horaMinutos = evento.hora.split(":");
                    var _ano = _data[2];
                    var _mes = _data[1] - 1;
                    var _dia = _data[0];

                    var _hora = _horaMinutos[0];
                    var _minutos = _horaMinutos[1];

                    var _dataNotificacao = new Date(_ano, _mes, _dia, _hora, _minutos, 0, 0);
                    var _dataNotificacao = _dataNotificacao.getTime();
                    var _dataNotificacao = new Date(_dataNotificacao - (evento.minutosAntesDoEvento * 60000));

                    console.log(_dataNotificacao);
                    //Agenda A notificao
                    $cordovaLocalNotification.schedule({
                        id: evento.id,
                        title: 'Evento: ' + evento.nome,
                        text: 'Local: ' + evento.local + ' - Hora: ' + evento.hora,
                        at: _dataNotificacao
                    }).then(function (result) {
                        // ...
                    });

                    //Atualiza a Lista
                    for (var i = 0; i < eventos.length; i++) {
                        if (eventos[i].id == evento.id) {
                            eventos[i] = evento;
                        }
                    }

                }, function (error) {
                    console.log(JSON.stringify(error));
                });

            }
        }

    })


    .factory('LembrancaFactory', function ($cordovaSQLite) {

        var lembrancas = [];

        return {

            listar: function () {

                var query = "select rowid, lembranca, descricao from lembrancas";
                $cordovaSQLite.execute(db, query, []).then(function (result) {

                    if (result.rows.length > 0) {

                        for (var i = 0; i < result.rows.length; i++) {

                            lembrancas.push(
                                {
                                    id: result.rows.item(i).rowid,
                                    lembranca: result.rows.item(i).lembranca,
                                    descricao: result.rows.item(i).descricao
                                }
                            )
                        }
                    }

                }, function (error) {
                    console.log(JSON.stringify(error));
                });

                return lembrancas;
            },


            pegarPorId: function (lembrancaId) {
                for (var i = 0; i < lembrancas.length; i++) {
                    if (lembrancas[i].id == lembrancaId) {
                        return lembrancas[i];
                    }
                }
                return undefined;
            },

            remover: function (lembrancaId) {

                var query = "delete from lembrancas where rowid = ?";
                $cordovaSQLite.execute(db, query, [lembrancaId]).then(function (result) {
                    for (var i = 0; i < lembrancas.length; i++) {
                        if (lembrancas[i].id == lembrancaId) {
                            lembrancas.splice(i, 1);
                        }
                    }
                }, function (error) {
                    console.log(JSON.stringify(error));
                });

            },

            adicionar: function (lembranca) {

                var query = "insert into lembrancas(lembranca, descricao) values (?,?)";
                $cordovaSQLite.execute(db, query, [lembranca.lembranca, lembranca.descricao]).then(function (result) {
                    lembrancas.push({
                        id: result.insertId,
                        lembranca: lembranca.lembranca,
                        descricao: lembranca.descricao
                    });
                }, function (error) {
                    console.log(JSON.stringify(error));
                });

            },

            editar: function (lembranca) {

                var query = "update alergias set nome = ?, descricao = ? where rowid = ?";
                $cordovaSQLite.execute(db, query, [lembranca.lembranca, lembranca.descricao, lembranca.id]).then(function (result) {

                    for (var i = 0; i < lembrancas.length; i++) {
                        if (lembrancas[i].id == lembranca.id) {
                            lembrancas[i] = lembranca;
                        }
                    }

                }, function (error) {
                    console.log(JSON.stringify(error));
                });

            }
        }

    })

    .factory('HistoricoFactory', function ($cordovaSQLite) {

        var historico = { id: 0, descricao: '' };

        return {


            carregar: function () {
                var query = "select rowid, descricao from historico";
                $cordovaSQLite.execute(db, query, []).then(function (result) {

                    if (result.rows.length > 0) {
                        historico.id = result.rows.item(0).rowid;
                        historico.descricao = result.rows.item(0).descricao;
                    }

                }, function (error) {
                    console.log(JSON.stringify(error));
                });

                return historico;
            },


            adicionar: function (historico) {

                if (historico.id == 0) {
                    var query = "insert into historico(descricao) values (?)";
                    $cordovaSQLite.execute(db, query, [historico.descricao]).then(function (result) {
                        historico.id = result.insertId;
                        historico.descricao = historico.descricao;
                    }, function (error) {
                        console.log(JSON.stringify(error));
                    });

                } else {
                    var query = "update historico set  descricao = ? where rowid = ?";
                    $cordovaSQLite.execute(db, query, [historico.descricao, historico.id]).then(function (result) {
                        historico.id = historico.id;
                        historico.descricao = historico.descricao;
                    }, function (error) {
                        console.log(JSON.stringify(error));
                    });

                }

            }

        }

    })


    .factory('DadosPacienteFactory', function ($cordovaSQLite) {

        var dadosPaciente = { id: 0, fotoURI: 'img/avatar.png', nome: '', sexo: 'M', dataNascimento: '__/__/____', estagioAlzheimer: { id: 1, nome: 'Intermediário' } };

        return {

            carregar: function () {
                var query = "select rowid, fotoURI, nome, sexo, dataNascimento, estagioAlzheimer from dadosPaciente";
                $cordovaSQLite.execute(db, query, []).then(function (result) {
                    if (result.rows.length > 0) {
                        dadosPaciente.id = result.rows.item(0).rowid;
                        dadosPaciente.fotoURI = result.rows.item(0).fotoURI;
                        dadosPaciente.nome = result.rows.item(0).nome;
                        dadosPaciente.sexo = result.rows.item(0).sexo;
                        dadosPaciente.dataNascimento = result.rows.item(0).dataNascimento;
                        //isso é muito porco porém o ng-Options não da outra alternativa para resolver de uma forma melhor
                        if (result.rows.item(0).estagioAlzheimer == 'Inicial') {
                            dadosPaciente.estagioAlzheimer = { id: 0, nome: 'Inicial' };
                        }
                        if (result.rows.item(0).estagioAlzheimer == 'Intermediário') {
                            dadosPaciente.estagioAlzheimer = { id: 1, nome: 'Intermediário' };
                        }
                        if (result.rows.item(0).estagioAlzheimer == 'Avançado') {
                            dadosPaciente.estagioAlzheimer = { id: 2, nome: 'Avançado' };
                        }


                    }

                }, function (error) {
                    console.log(JSON.stringify(error));
                });

                return dadosPaciente;
            },

            adicionar: function (dadosPaciente) {

                if (dadosPaciente.id == 0) {
                    var query = "insert into dadosPaciente(fotoURI, nome, sexo, dataNascimento, estagioAlzheimer) values (?,?,?,?,?)";
                    $cordovaSQLite.execute(db, query,
                        [dadosPaciente.fotoURI, dadosPaciente.nome, dadosPaciente.sexo, dadosPaciente.dataNascimento, dadosPaciente.estagioAlzheimer]
                    ).then(function (result) {
                        dadosPaciente.id = result.insertId;
                        dadosPaciente.fotoURI = dadosPaciente.fotoURI;
                        dadosPaciente.nome = dadosPaciente.nome;
                        dadosPaciente.sexo = dadosPaciente.sexo;
                        dadosPaciente.dataNascimento = dadosPaciente.dataNascimento;
                        dadosPaciente.estagioAlzheimer = dadosPaciente.estagioAlzheimer;
                    }, function (error) {
                        console.log(JSON.stringify(error));
                    });

                } else {
                    var query = "update dadosPaciente set  fotoURI = ?, nome = ?, sexo = ?, dataNascimento = ?, estagioAlzheimer = ? where rowid = ?";
                    $cordovaSQLite.execute(db, query,
                        [dadosPaciente.fotoURI, dadosPaciente.nome, dadosPaciente.sexo, dadosPaciente.dataNascimento, dadosPaciente.estagioAlzheimer, dadosPaciente.id]
                    ).then(function (result) {
                        dadosPaciente.id = dadosPaciente.id;
                        dadosPaciente.fotoURI = dadosPaciente.fotoURI;
                        dadosPaciente.nome = dadosPaciente.nome;
                        dadosPaciente.sexo = dadosPaciente.sexo;
                        dadosPaciente.dataNascimento = dadosPaciente.dataNascimento;
                        dadosPaciente.estagioAlzheimer = dadosPaciente.estagioAlzheimer;
                    }, function (error) {
                        console.log(JSON.stringify(error));
                    });

                }

            }

        }

    })


    .factory('ContatoFactory', function ($cordovaSQLite) {

        var contatos = [];

        return {

            listar: function () {

                var query = "select rowid, nome , endereco , CEP , bairro , cidade , celular , responsavel , cuidador, fotoURI  from contatos";
                $cordovaSQLite.execute(db, query, []).then(function (result) {

                    if (result.rows.length > 0) {

                        for (var i = 0; i < result.rows.length; i++) {

                            contatos.push(
                                {
                                    id: result.rows.item(i).rowid,
                                    nome: result.rows.item(i).nome,
                                    endereco: result.rows.item(i).endereco,
                                    CEP: result.rows.item(i).CEP,
                                    bairro: result.rows.item(i).bairro,
                                    cidade: result.rows.item(i).cidade,
                                    celular: result.rows.item(i).celular,
                                    responsavel: result.rows.item(i).responsavel,
                                    cuidador: result.rows.item(i).cuidador,
                                    fotoURI: result.rows.item(i).fotoURI
                                }
                            )
                        }
                    }

                }, function (error) {
                    console.log(JSON.stringify(error));
                });

                return contatos;
            },


            pegarPorId: function (contatoId) {
                for (var i = 0; i < contatos.length; i++) {
                    if (contatos[i].id == contatoId) {
                        return contatos[i];
                    }
                }
                return undefined;
            },

            remover: function (contatoId) {

                var query = "delete from contatos where rowid = ?";
                $cordovaSQLite.execute(db, query, [contatoId]).then(function (result) {
                    for (var i = 0; i < contatos.length; i++) {
                        if (contatos[i].id == contatoId) {
                            contatos.splice(i, 1);
                        }
                    }
                }, function (error) {
                    console.log(JSON.stringify(error));
                });

            },

            adicionar: function (contato) {

                var query = "insert into contatos(nome , endereco , CEP , bairro , cidade , celular , responsavel , cuidador, fotoURI) values (?,?,?,?,?,?,?,?,?)";
                $cordovaSQLite.execute(db, query,
                    [contato.nome, contato.endereco, contato.CEP, contato.bairro, contato.cidade, contato.celular, contato.responsavel, contato.cuidador, contato.fotoURI]
                ).then(function (result) {
                    contatos.push({
                        id: result.insertId,
                        nome: contato.nome,
                        endereco: contato.endereco,
                        CEP: contato.CEP,
                        bairro: contato.bairro,
                        cidade: contato.cidade,
                        celular: contato.celular,
                        responsavel: contato.responsavel,
                        cuidador: contato.cuidador,
                        fotoURI: contato.fotoURI
                    });
                }, function (error) {
                    console.log(JSON.stringify(error));
                });

            },

            editar: function (contato) {

                var query = "update contatos set nome = ? , endereco = ? , CEP = ? , bairro = ? , cidade = ? , celular = ? , responsavel = ? , cuidador = ? , fotoURI = ? where rowid = ?";
                $cordovaSQLite.execute(db, query,
                    [contato.nome, contato.endereco, contato.CEP, contato.bairro, contato.cidade, contato.celular, contato.responsavel, contato.cuidador, contato.fotoURI, contato.id]
                ).then(function (result) {

                    for (var i = 0; i < contatos.length; i++) {
                        if (contatos[i].id == contato.id) {
                            contatos[i] = contato;
                        }
                    }

                }, function (error) {
                    console.log(JSON.stringify(error));
                });

            }
        }

    })

    .factory('DicaFactory', function ($cordovaSQLite) {

        var dicas = [];

        return {

            listar: function () {

                var query = "select rowid, nome , link from dicas";
                $cordovaSQLite.execute(db, query, []).then(function (result) {

                    if (result.rows.length > 0) {

                        for (var i = 0; i < result.rows.length; i++) {

                            dicas.push(
                                {
                                    id: result.rows.item(i).rowid,
                                    nome: result.rows.item(i).nome,
                                    link: result.rows.item(i).link
                                }
                            )
                        }
                    }

                }, function (error) {
                    console.log(JSON.stringify(error));
                });

                return dicas;
            },


            pegarPorId: function (dicaId) {
                for (var i = 0; i < dicas.length; i++) {
                    if (dicas[i].id == dicaId) {
                        return dicas[i];
                    }
                }
                return undefined;
            },

            remover: function (dicaId) {

                var query = "delete from dicas where rowid = ?";
                $cordovaSQLite.execute(db, query, [dicaId]).then(function (result) {
                    for (var i = 0; i < dicas.length; i++) {
                        if (dicas[i].id == dicaId) {
                            dicas.splice(i, 1);
                        }
                    }
                }, function (error) {
                    console.log(JSON.stringify(error));
                });

            },

            adicionar: function (dica) {

                if (dica.link.substring(0, 7) != 'http://') {
                    dica.link = 'http://' + dica.link;
                }
                console.log(dica.link);

                var query = "insert into dicas(nome ,link) values (?,?)";
                $cordovaSQLite.execute(db, query, [dica.nome, dica.link]).then(function (result) {
                    dicas.push({
                        id: result.insertId,
                        nome: dica.nome,
                        link: dica.link
                    });
                }, function (error) {
                    console.log(JSON.stringify(error));
                });

            },

            editar: function (dica) {

                if (dica.link.substring(0, 7) != 'http://') {
                    dica.link = 'http://' + dica.link;
                }
                console.log(dica.link);

                var query = "update dicas set nome = ? , link = ? where rowid = ?";
                $cordovaSQLite.execute(db, query, [dica.nome, dica.link, dica.id]).then(function (result) {

                    for (var i = 0; i < dicas.length; i++) {
                        if (dicas[i].id == dica.id) {
                            dicas[i] = dica;
                        }
                    }

                }, function (error) {
                    console.log(JSON.stringify(error));
                });

            }
        }

    })

    .factory('DoencaFactory', function ($cordovaSQLite) {

        var doencas = [];

        return {

            listar: function () {

                var query = "select rowid, nome , diagnosticadaEm, estagio, sintomas, medicacoes  from doencas";
                $cordovaSQLite.execute(db, query, []).then(function (result) {

                    if (result.rows.length > 0) {

                        for (var i = 0; i < result.rows.length; i++) {

                            doencas.push(
                                {
                                    id: result.rows.item(i).rowid,
                                    nome: result.rows.item(i).nome,
                                    diagnosticadaEm: result.rows.item(i).diagnosticadaEm,
                                    estagio: result.rows.item(i).estagio,
                                    sintomas: result.rows.item(i).sintomas,
                                    medicacoes: result.rows.item(i).medicacoes
                                }
                            )
                        }
                    }

                }, function (error) {
                    console.log(JSON.stringify(error));
                });

                return doencas;
            },


            pegarPorId: function (doencaId) {
                for (var i = 0; i < doencas.length; i++) {
                    if (doencas[i].id == doencaId) {

                        //isso é muito porco porém o ng-Options não tenho alternativa para resolver de uma forma melhor
                        if (doencas[i].estagio == 'Inicial') {
                            doencas[i].estagio = { id: 0, nome: 'Inicial' };
                        }
                        if (doencas[i].estagio == 'Intermediário') {
                            doencas[i].estagio = { id: 1, nome: 'Intermediário' };
                        }
                        if (doencas[i].estagio == 'Avançado') {
                            doencas[i].estagio = { id: 2, nome: 'Avançado' };
                        }

                        return doencas[i];
                    }
                }
                return undefined;
            },

            remover: function (doencaId) {

                var query = "delete from doencas where rowid = ?";
                $cordovaSQLite.execute(db, query, [doencaId]).then(function (result) {
                    for (var i = 0; i < doencas.length; i++) {
                        if (doencas[i].id == doencaId) {
                            doencas.splice(i, 1);
                        }
                    }
                }, function (error) {
                    console.log(JSON.stringify(error));
                });

            },

            adicionar: function (doenca) {


                var query = "insert into doencas(nome, diagnosticadaEm, estagio, sintomas, medicacoes) values (?,?,?,?,?)";
                $cordovaSQLite.execute(db, query,
                    [doenca.nome, doenca.diagnosticadaEm, doenca.estagio, doenca.sintomas, doenca.medicacoes])
                    .then(function (result) {
                        doencas.push({
                            id: result.insertId,
                            nome: doenca.nome,
                            diagnosticadaEm: doenca.diagnosticadaEm,
                            estagio: doenca.estagio,
                            sintomas: doenca.sintomas,
                            medicacoes: doenca.medicacoes
                        });
                    }, function (error) {
                        console.log(JSON.stringify(error));
                    });

            },

            editar: function (doenca) {



                var query = "update doencas set nome = ? , diagnosticadaEm = ?, estagio = ?, sintomas = ?, medicacoes = ? where rowid = ?";
                $cordovaSQLite.execute(db, query,
                    [doenca.nome, doenca.diagnosticadaEm, doenca.estagio, doenca.sintomas, doenca.medicacoes, doenca.id])
                    .then(function (result) {

                        for (var i = 0; i < doencas.length; i++) {
                            if (doencas[i].id == doenca.id) {
                                doencas[i] = doenca;
                            }
                        }

                    }, function (error) {
                        console.log(JSON.stringify(error));
                    });

            }
        }

    })


    .factory('MedicoFactory', function ($cordovaSQLite) {

        var medicos = [];

        return {

            listar: function () {

                var query = "select rowid, nome, especialidade, telefone, email, fotoURI from medicos";
                $cordovaSQLite.execute(db, query, []).then(function (result) {

                    if (result.rows.length > 0) {

                        for (var i = 0; i < result.rows.length; i++) {

                            medicos.push(
                                {
                                    id: result.rows.item(i).rowid,
                                    nome: result.rows.item(i).nome,
                                    especialidade: result.rows.item(i).especialidade,
                                    telefone: result.rows.item(i).telefone,
                                    email: result.rows.item(i).email,
                                    fotoURI: result.rows.item(i).fotoURI
                                }
                            )
                        }
                    }

                }, function (error) {
                    console.log(JSON.stringify(error));
                });

                return medicos;
            },


            pegarPorId: function (medicoId) {
                for (var i = 0; i < medicos.length; i++) {
                    if (medicos[i].id == medicoId) {
                        return medicos[i];
                    }
                }
                return undefined;
            },

            remover: function (medicoId) {

                var query = "delete from medicos where rowid = ?";
                $cordovaSQLite.execute(db, query, [medicoId]).then(function (result) {
                    for (var i = 0; i < medicos.length; i++) {
                        if (medicos[i].id == medicoId) {
                            medicos.splice(i, 1);
                        }
                    }
                }, function (error) {
                    console.log(JSON.stringify(error));
                });

            },

            adicionar: function (medico) {

                var query = "insert into medicos(nome, especialidade, telefone, email, fotoURI) values (?,?,?,?,?)";
                $cordovaSQLite.execute(db, query, [medico.nome, medico.especialidade, medico.telefone, medico.email, medico.fotoURI]).then(function (result) {
                    medicos.push({
                        id: result.insertId,
                        nome: medico.nome,
                        especialidade: medico.especialidade,
                        telefone: medico.telefone,
                        email: medico.email,
                        fotoURI: medico.fotoURI
                    });
                }, function (error) {
                    console.log(JSON.stringify(error));
                });

            },

            editar: function (medico) {

                var query = "update medicos set nome = ?, especialidade = ?, telefone = ?, email = ?, fotoURI = ?  where rowid = ?";
                $cordovaSQLite.execute(db, query, [medico.nome, medico.especialidade, medico.telefone, medico.email, medico.fotoURI, medico.id]).then(function (result) {

                    for (var i = 0; i < medicos.length; i++) {
                        if (medicos[i].id == medico.id) {
                            medicos[i] = medico;
                        }
                    }

                }, function (error) {
                    console.log(JSON.stringify(error));
                });

            }
        }

    })

    .factory('MedicamentoFactory', function ($cordovaSQLite, $cordovaLocalNotification) {

        var medicamentos = [];

        return {

            listar: function () {

                var query = "select rowid, nome, fazUsoDesde, dose, horarios, alarme from medicamentos";
                $cordovaSQLite.execute(db, query, []).then(function (result) {

                    if (result.rows.length > 0) {

                        for (var i = 0; i < result.rows.length; i++) {

                            console.log(JSON.stringify(result.rows.item(i).horarios, null, 4));

                            medicamentos.push(
                                {
                                    id: result.rows.item(i).rowid,
                                    nome: result.rows.item(i).nome,
                                    fazUsoDesde: result.rows.item(i).fazUsoDesde,
                                    dose: result.rows.item(i).dose,
                                    horarios: result.rows.item(i).horarios.split("*"),
                                    alarme: result.rows.item(i).alarme
                                }
                            )
                        }
                    }

                }, function (error) {
                    console.log(JSON.stringify(error));
                });

                return medicamentos;
            },


            pegarPorId: function (medicamentoId) {
                for (var i = 0; i < medicamentos.length; i++) {
                    if (medicamentos[i].id == medicamentoId) {
                        return medicamentos[i];
                    }
                }
                return undefined;
            },

            remover: function (medicamentoId) {


                //Apagar o medicamentos agendados
                var query = "select * from medicamentos where rowid = ?";
                $cordovaSQLite.execute(db, query, [medicamentoId]).then(function (result) {

                    if (result.rows.length > 0) {

                        var horarios = result.rows.item(0).horarios.split("*");

                        for (var i = 0; i < horarios.length; i++) {

                            var _data = result.rows.item(0).fazUsoDesde.split("/");

                            var _horaMinutos = horarios[i].split(":");
                            var _ano = _data[2];
                            var _mes = _data[1] - 1;
                            var _dia = _data[0];

                            var _hora = _horaMinutos[0];
                            var _minutos = _horaMinutos[1];

                            var _dataId = new Date(_ano, _mes, _dia, _hora, _minutos, 0, 0);
                            var _dataId = _dataId.getTime();

                            var idSchedule = medicamentoId.toString().concat(_dataId.toString());
                            console.log(idSchedule);
                            //Cancelar a notificacao
                            $cordovaLocalNotification.cancel(idSchedule).then(function (result) { });
                        }

                    }

                }, function (error) {
                    console.log(JSON.stringify(error));
                });

                query = "delete from medicamentos where rowid = ?";
                $cordovaSQLite.execute(db, query, [medicamentoId]).then(function (result) {

                    for (var i = 0; i < medicamentos.length; i++) {
                        if (medicamentos[i].id == medicamentoId) {
                            medicamentos.splice(i, 1);
                        }
                    }



                }, function (error) {
                    console.log(JSON.stringify(error));
                });

            },

            adicionar: function (medicamento) {

                var query = "insert into medicamentos(nome, fazUsoDesde, dose, horarios, alarme) values (?,?,?,?,?)";
                var strHorarios = "";
                for (var i = 0; i < medicamento.horarios.length; i++) {
                    strHorarios = strHorarios + medicamento.horarios[i] + '*'
                }
                strHorarios = strHorarios.slice(0, strHorarios.length - 1);

                $cordovaSQLite.execute(db, query, [medicamento.nome, medicamento.fazUsoDesde, medicamento.dose, strHorarios, medicamento.alarme])
                    .then(function (result) {

                        if (medicamento.alarme) {

                            for (var i = 0; i < medicamento.horarios.length; i++) {


                                var _data = medicamento.fazUsoDesde.split("/");
                                var _horaMinutos = medicamento.horarios[i].split(":");
                                var _ano = _data[2];
                                var _mes = _data[1] - 1;
                                var _dia = _data[0];
                                var _hora = _horaMinutos[0];
                                var _minutos = _horaMinutos[1];
                                var _dataId = new Date(_ano, _mes, _dia, _hora, _minutos, 0, 0);
                                var _dataId = _dataId.getTime();

                                //Uso o fazUsoDesde para compor o id schedule porem não uso ele para agendar
                                var idSchedule = result.insertId.toString().concat(_dataId.toString());
                                console.log(idSchedule);

                                //altero a data para hoje ou amanha dependendo do hr
                                var _dataHoraNotificacao = new Date();
                                _dataHoraNotificacao.setHours(_hora);
                                _dataHoraNotificacao.setMinutes(_minutos);
                                _dataHoraNotificacao = _dataHoraNotificacao.getTime();

                                var _agora = new Date();
                                _agora = _agora.getTime();

                                var _firstAt = new Date();
                                _firstAt.setHours(_hora);
                                _firstAt.setMinutes(_minutos);

                                if (_agora >= _dataHoraNotificacao) {
                                    _firstAt.setDate(_firstAt.getDate() + 1);
                                }

                                _firstAt = _firstAt.getTime();

                                //ate aqui esta correto

                                //Agenda A notificao
                                $cordovaLocalNotification.schedule({
                                    id: idSchedule,
                                    title: 'Medicamento',
                                    text: 'Nome: ' + medicamento.nome + ' - Horário: ' + medicamento.horarios[i],
                                    firstAt: _firstAt,
                                    every: 'day'
                                }).then(function (result) {
                                    // ...
                                });
                            }
                        }

                        medicamentos.push({
                            id: result.insertId,
                            nome: medicamento.nome,
                            fazUsoDesde: medicamento.fazUsoDesde,
                            dose: medicamento.dose,
                            horarios: medicamento.horarios,
                            alarme: medicamento.alarme
                        });
                    }, function (error) {
                        console.log(JSON.stringify(error));
                    });

            },

            editar: function (medicamento) {

                //Deleta as notificações
                var query = "select * from medicamentos where rowid = ?";
                $cordovaSQLite.execute(db, query, [medicamento.id]).then(function (result) {

                    if (result.rows.length > 0) {

                        var horarios = result.rows.item(0).horarios.split("*");

                        for (var i = 0; i < horarios.length; i++) {

                            var _data = result.rows.item(0).fazUsoDesde.split("/");

                            var _horaMinutos = horarios[i].split(":");
                            var _ano = _data[2];
                            var _mes = _data[1] - 1;
                            var _dia = _data[0];

                            var _hora = _horaMinutos[0];
                            var _minutos = _horaMinutos[1];

                            var _dataId = new Date(_ano, _mes, _dia, _hora, _minutos, 0, 0);
                            var _dataId = _dataId.getTime();

                            var idSchedule = medicamento.id.toString().concat(_dataId.toString());
                            console.log(idSchedule);
                            //Cancelar a notificacao
                            $cordovaLocalNotification.cancel(idSchedule).then(function (result) { });
                        }

                    }

                }, function (error) {
                    console.log(JSON.stringify(error));
                });

                var query = "update medicamentos set nome = ?, fazUsoDesde = ?, dose = ?, horarios = ?, alarme = ?  where rowid = ?";

                var strHorarios = "";
                for (var i = 0; i < medicamento.horarios.length; i++) {
                    strHorarios = strHorarios + medicamento.horarios[i] + '*'
                }
                strHorarios = strHorarios.slice(0, strHorarios.length - 1)


                $cordovaSQLite.execute(db, query, [medicamento.nome, medicamento.fazUsoDesde, medicamento.dose, strHorarios, medicamento.alarme, medicamento.id])
                    .then(function (result) {



                        //Se for Alarme Insere elas novamente
                        if (medicamento.alarme) {

                            for (var i = 0; i < medicamento.horarios.length; i++) {


                                var _data = medicamento.fazUsoDesde.split("/");
                                var _horaMinutos = medicamento.horarios[i].split(":");
                                var _ano = _data[2];
                                var _mes = _data[1] - 1;
                                var _dia = _data[0];
                                var _hora = _horaMinutos[0];
                                var _minutos = _horaMinutos[1];
                                var _dataId = new Date(_ano, _mes, _dia, _hora, _minutos, 0, 0);
                                var _dataId = _dataId.getTime();

                                //Uso o fazUsoDesde para compor o id schedule porem não uso ele para agendar
                                var idSchedule = result.insertId.toString().concat(_dataId.toString());
                                console.log(idSchedule);

                                //altero a data para hoje ou amanha dependendo do hr
                                var _dataHoraNotificacao = new Date();
                                _dataHoraNotificacao.setHours(_hora);
                                _dataHoraNotificacao.setMinutes(_minutos);
                                _dataHoraNotificacao = _dataHoraNotificacao.getTime();

                                var _agora = new Date();
                                _agora = _agora.getTime();

                                var _firstAt = new Date();
                                _firstAt.setHours(_hora);
                                _firstAt.setMinutes(_minutos);

                                if (_agora >= _dataHoraNotificacao) {
                                    _firstAt.setDate(_firstAt.getDate() + 1);
                                }

                                _firstAt = _firstAt.getTime();

                                //ate aqui esta correto

                                //Agenda A notificao
                                $cordovaLocalNotification.schedule({
                                    id: idSchedule,
                                    title: 'Medicamento',
                                    text: 'Nome: ' + medicamento.nome + ' - Horário: ' + medicamento.horarios[i],
                                    firstAt: _firstAt,
                                    every: 'day'
                                }).then(function (result) {
                                    // ...
                                });
                            }
                        }

                        //Atualiza o medicamento no Array
                        for (var i = 0; i < medicamentos.length; i++) {
                            if (medicamentos[i].id == medicamento.id) {
                                medicamentos[i] = medicamento;
                            }
                        }

                    }, function (error) {
                        console.log(JSON.stringify(error));
                    });

            }
        }

    });






