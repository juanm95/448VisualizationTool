$( "#slider" ).slider({
    value: 4,
    min: 1,
    max: 7,
    step: 1
})
.each(function() {

  //
  // Add labels to slider whose values 
  // are specified by min, max and whose
  // step is set to 1
  //

  // Get the options for this slider
  var opt = $(this).data().uiSlider.options;
  
  // Get the number of possible values
  var vals = opt.max - opt.min;
  
  // Space out values
  for (var i = 0; i <= vals; i++) {
    
    var el = $('<label>'+(i+1)+'</label>').css('left',(i/vals*100)+'%');
  
    $( "#slider" ).append(el);
    
  }
  
});

$( ".slider" ).slider({
  change: function( event, ui ) {
console.log("yo");  }
});