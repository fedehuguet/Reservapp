Cruises = new Mongo.Collection('Cruises');
Pasajeros = new Mongo.Collection('Pasajeros');

if (Meteor.isClient) {

Template.cruisesadmin.helpers({
  cruises: function(){
    return Cruises.find({},{sort: {createdAt: -1}});
  },
  pasajeros: function(){
    return Pasajeros.find({},{sort: {createdAt: -1}});
  }
});

Template.cruises.helpers({
  cruises: function(){
    return Cruises.find({},{sort: {createdAt: -1}});
  }
});

Template.cruisesadmin.events({
  "submit .add-cruise": function(event){
    var fecha = event.target.fecha.value;
    var namecruise = event.target.namecruise.value;
    var origin = event.target.origin.value;
    var destination = event.target.destination.value;
    var pasajeros= Number(event.target.pasajeros.value);
    var precio= Number(event.target.precio.value);

    //var n = fechaprimera.search('T');
    //fecha="Dia: "+fechaprimera.slice(0,n+1) + " Hora: " + fechaprimera.slice(n+1,n+7);

    Meteor.call('addCruise', fecha, namecruise, origin, destination, pasajeros, precio);

    event.target.fecha.value = '';
    event.target.namecruise.value = '';
    event.target.origin.value = '';
    event.target.destination.value = '';
    event.target.pasajeros.value = '';
    event.target.precio.value = '';

    return false;
  },

  "click .delete-cruise": function(event){
    if(confirm('Eliminar crucero?')){
      Meteor.call('deleteCruise', this._id);
    }
    return false;
  },
    "click .delete-pasajero": function(event){
    if(confirm('Eliminar pasajero?')){
      Pasajeros.remove(this._id);
      Cruises.find({namecruise: this.namecruise}).forEach(function(match){
          Cruises.update(match._id, { $inc: { pasajeros : +1 }})
          });
    }
    return false;
  }

});

Template.buscar.events({
  "submit .search-cruise": function(event){
    var nombre = event.target.nombre.value;
    var namecruise = event.target.namecruise.value;
    var origin = event.target.origin.value;
    var destination = event.target.destination.value;
    var mail = event.target.mail.value;
    var precio=0;
    var personas=0;
    var caben=true;
    var valido=false;

    var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

    if (!filter.test(mail)) {
    alert('¡E-mail no valido!');
    mail.focus;
    }
    else{
      valido=true;
    }

      if(valido){
    //Meteor.call('searchCruise', nombre, namecruise, origin, destination);
              if(Cruises.find({$and:[
                  {namecruise: namecruise},
                  {origin: origin},
                  {destination: destination},
                  ]})){
                alert("Crucero no encontrado");
              }
              else {
                Cruises.find({$and:[
                  {namecruise: namecruise},
                  {origin: origin},
                  {destination: destination},
                  ]}).forEach(function(match){
                    precio=match.precio;
                    personas=match.pasajeros;
                    fecha=match.fecha;
                    });
                  if(personas-1>=0){
                        if(confirm('Fecha de partida: ' +fecha+
                         '\nNombre Crucero: ' + namecruise + '\nOrigen: ' + origin + '\nDestino: ' + destination + '\nPrecio total: $' + precio + '\n¿Desea reservar?')){
                          Pasajeros.insert({
                            nombre: nombre,
                            mail: mail,
                            namecruise: namecruise,
                            preciototal: precio
                          });
                          if(personas-1>0){
                                Cruises.find({$and:[
                                {namecruise: namecruise},
                                {origin: origin},
                                {destination: destination},
                                ]}).forEach(function(match){
                                  Cruises.update(match._id, { $inc: { pasajeros : -1 }})
                                  });
                             }
                            else if(personas-1==0){
                                Cruises.find({$and:[
                                {namecruise: namecruise},
                                {origin: origin},
                                {destination: destination},
                                ]}).forEach(function(match){
                                  Cruises.update(match._id, { $inc: { pasajeros : -1 }}, { $set: { caben : false }})
                                  });
                            }
                           alert('Reservo 1 boleto\nPague en su banco de preferencia\nGracias!');
                      } 
                    }
                    else{
                         alert('El crucero '+ namecruise + ' esta lleno, lo sentimos o no existe');
                       }
              }

            }

    event.target.nombre.value = '';
    event.target.mail.value = '';
    event.target.namecruise.value = '';
    event.target.origin.value = '';
    event.target.destination.value = '';
    event.target.destination.value = '';

    return false;
}

});

Template.cruises.events({

  "click .reserve-cruise": function(event){
    var cant = Number(document.getElementById("cantidad").value);
      if(this.pasajeros-cant>=0){
            if(confirm('Precio individual' + this.precio + '\nTotal: ' +this.precio*cant+ '\nReservar Crucero?')){
              for(var contador=1; contador<=cant; contador++){
                var valido=false;
                var nombre= prompt("Nombre Pasajero " + contador);
                while(valido==false){
                  var mail= prompt("E-mail Pasajero" + contador);
                  var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
                  if (!filter.test(mail)) {
                    alert('¡E-mail no valido!');
                    mail.focus;
                  }
                  else{
                    valido=true;
                  }
                }
               Pasajeros.insert({
                  nombre: nombre,
                  mail: mail,
                  namecruise: this.namecruise,
                  preciototal: this.precio
                });
             }
               alert('Reservo' + cant +' boletos\nPague en su banco de preferencia\nGracias!');
                if(this.pasajeros-cant>0){
                      Cruises.update(
                        this._id,
                        { $inc: { pasajeros : -cant } 
                      });
                }
                else if(this.pasajeros-cant==0){
                      Cruises.update(
                        this._id,
                        { $inc: { pasajeros : -cant }},
                        { $set: { caben : false }}
                        );
                }
            }
          }
        else{
          alert('No hay '+cant+ ' lugares, solo quedan ' + this.pasajeros);
        }
    return false;
  }
});
}

if (Meteor.isServer) {

}

Meteor.methods({
  addCruise: function(fecha, namecruise, origin, destination, pasajeros, precio){
  if(!Meteor.userId){
    throw new Meteor.Error('No Access!');
  }

  Cruises.insert({
      fecha: fecha,
      namecruise: namecruise,
      origin: origin,
      destination: destination,
      pasajeros: pasajeros,
      precio: precio,
      createdAt: new Date,
      caben: true
    });
  },
  deleteCruise: function(cruiseId){
    Cruises.remove(cruiseId);
    //Pasajeros.remove({});
  }

});