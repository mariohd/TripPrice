$(document).ready(function (){
	$('#saveTrip').click(function () {
		var pom = document.createElement('a');
  	pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(trip, true, 4)));
  	pom.setAttribute('download', 'tripTo'+ trip.city + trip.country + '.txt');
  	pom.click();
	});

	$('#tripConfigIcon').click(function () {
		var wWidth = $(window).width(),
				dWidth = wWidth * 0.6,
				wHeight = $(window).height(),
				dHeight = wHeight * 0.5;

		$('#tripBegin').val(trip.begin);
		$('#tripEnd').val(trip.end);
		$('#tripCity').val(trip.city);
		$('#tripCountry').val(trip.country);
		$('#tripConfig').dialog({
			width: dWidth,
			height: dHeight
		});
	});

	$('#saveTripConfig').click(function () {
		trip.begin = $('#tripBegin').val();
		trip.end = $('#tripEnd').val();
		trip.city = $('#tripCity').val();
		trip.country = $('#tripCountry').val();
		$('#tripConfig').dialog('close');
	});

	$( "body" ).delegate( ".bin", "click", function() {
	 var line = $(this).data('index'),
	 		 parentTable = $(this).closest('table');
		$(parentTable).easyTable( 'removeRow' , { indexes: [ line ] } );
		trip.costs.splice(line, 1);
		loadCosts();
	});

	$( "body" ).delegate( ".pencil", "click", function() {
	 var line = $(this).data('index'),
	 		 parentTable = $(this).closest('table');
		var cost = trip.costs[line];
		$('#costLine').val(line);
		$('#dateCostsUpd').val(cost.date);
		$('#placeOfCostsUpd').val(cost.place);
		$('#categoriesOfCostsUpd').val(cost.category);
		$('#valueOfCostsUpd').val(cost.value);
		$('#paymentOfCostsUpd').val(cost.payment);
		$('#categoriesOfCostsUpd').empty();
		trip.categories.forEach(function (c) {
			$('#categoriesOfCostsUpd').append('<option>' + c + '</option>');
		});
		$('#categoriesOfCostsUpd').append('<option>' + 'unknown' + '</option>');
		var wWidth = $(window).width(),
				dWidth = wWidth * 0.6,
				wHeight = $(window).height(),
				dHeight = wHeight * 0.5;
		$('#updateCosts').dialog({
			width: dWidth,
			height: dHeight
		});
	});

	$('#firstMenu #newTrip').click(function () {
		$('#firstMenu').hide(function () {
			$('#bt-menu').fadeIn('slow');
			$('#loadedTravel').show('slow');
			loadCosts();
		});
	});

	$("#fileChooser").change(function () {
		var file = this.files[0];
		if (file) {
				var reader = new FileReader();
				reader.readAsText(file);
				reader.onload = function(e) {
						trip = JSON.parse(e.target.result);
						$('#firstMenu').hide(function () {
							$('#bt-menu').fadeIn('slow');
							$('#loadedTravel').show('slow', function () {
								loadCosts();
							});
						});
				};
		}
	});

	$('#categories').click(function () {
		var wWidth = $(window).width(),
				dWidth = wWidth * 0.85,
    		wHeight = $(window).height(),
    		dHeight = wHeight * 0.6;
		fillCategoriesTable();
		$('#categoriesList').dialog({
			width: dWidth,
			height: dHeight
		});
	});

	$('#addNewCategorie').click(function () {
		trip.categories.push($('#newCategorieName').val().trim());
		var tbody = $('#categoriesTableBody'),
				tr = $('<tr><td>' + $('#newCategorieName').val() + '</td></tr>');
		tbody.append(tr);
		$('#newCategorieName').val('');
	});

	$('#costs').click(function () {
		$('#categoriesOfCosts').empty();
		trip.categories.forEach(function (c) {
			$('#categoriesOfCosts').append('<option>' + c + '</option>');
		});
		$('#categoriesOfCosts').append('<option>' + 'unknown' + '</option>');
		var wWidth = $(window).width(),
				dWidth = wWidth * 0.6,
				wHeight = $(window).height(),
				dHeight = wHeight * 0.5;
		$('#addCosts').dialog({
			width: dWidth,
			height: dHeight
		});
	});

	$('.date').datepicker({
    dateFormat: 'dd/mm/yy',
	});

	$('#addNewCost').click(function () {
		var cost = {};
		cost.date = $('#dateCosts').val();
		cost.place = $('#placeOfCosts').val();
		cost.category = $('#categoriesOfCosts').val() || "unknown";
		cost.value = $('#valueOfCosts').val();
		cost.payment = $('#paymentOfCosts').val();
		trip.costs.push(cost);
		$('#addCosts').dialog('close');
		loadCosts();
	});

	$('#updateCost').click(function () {
		var cost = {};
		cost.date = $('#dateCostsUpd').val();
		cost.place = $('#placeOfCostsUpd').val();
		cost.category = $('#categoriesOfCostsUpd').val() || "unknown";
		cost.value = $('#valueOfCostsUpd').val();
		cost.payment = $('#paymentOfCostsUpd').val();
		trip.costs[$('#costLine').val()] = cost;
		$('#updateCosts').dialog('close');
		loadCosts();
	});

});

var trip = trip ? trip : {categories: [], costs: []};

function fillCategoriesTable() {
	var tbody = $('#categoriesTableBody');
	tbody.empty();
	trip.categories.forEach(function (c) {
		tbody.append('<tr><td>' + c + '</td></tr>');
	});
};

function updateChartsjQPlot () {

	var data = [];

		trip.costs.forEach(function (c) {
			var present = data.filter(function (s) {
				return s[0] === c.category;
			});
			if ( ! present.length ) {
				var cCosts = trip.costs.filter(function (c1) {
					return c1.category === c.category;
				});

				var serie = [],
						total = 0.0;
				cCosts.forEach(function (c2) {
					total += parseFloat(c2.value);
				});
				serie.push(c.category);
				serie.push(total);
				data.push(serie);
			}
		});

		updateAmounts(data);

		if ( data.length ) {
			$('#categoriesChart').empty();
		  var plot1 = jQuery.jqplot ('categoriesChart', [data],
		    {
					height: 400,
					width: 400,
					title: {
        		text: 'Costs by Categories',   // title for the plot,
        		show: true,
    			},
					animate: true,
	        grid: {
	            drawBorder: false,
	            drawGridlines: false,
	            background: '#ffffff',
	            shadow:false
	        },
	        seriesDefaults:{
							shadow: false,
	            renderer:$.jqplot.PieRenderer,
	            rendererOptions: {
									sliceMargin: 4,
	                showDataLabels: true
	            }
	        },
	        legend: {
	            show: true,
	            location: 'e'
	        }
	    });
		}

};

function updateAmounts(data) {
	$('#resultsOfCosts table').empty();
	var total = 0.0;
	data.forEach(function (d) {
		var tr = $('<tr>');
		tr.append('<td class="name">' +  d[0] + '</td>');
		tr.append('<td class="value money">' +  parseFloat(d[1]).toFixed(2) + '</td>');
		$('#resultsOfCosts table').append(tr);
		total += parseFloat(d[1]);
	});
	var trTotal = $('<tr>');
	trTotal.append('<td class="total name">Total</td>');
	trTotal.append('<td class="total money">' + total.toFixed(2) +'</td>');
	$('#resultsOfCosts table').append(trTotal);
};

function loadCosts() {
	var tbody = $('#costsTable').find('tbody');
	tbody.empty();
	trip.costs.forEach(function (c, index) {
		var tr = $('<tr>');
		tr.append('<td>' + c.date + '</td>');
		tr.append('<td>' + c.place + '</td>');
		tr.append('<td>' + c.category + '</td>');
		tr.append('<td>' + c.payment + '</td>');
		tr.append('<td><span class="money">' + parseFloat(c.value).toFixed(2) + '</span></td>');
		tr.append('<td style="text-align: center;"><span data-index="'+ index +'" class="pencil icon icon-pencil"></span><span data-index="'+ index +'" class="bin icon icon-bin"></span></td>');
		tbody.append(tr);
	});
	if (tbody.find('tr').length) {
		$('#costsTable').easyTable('fixedHead');
	}
	updateChartsjQPlot();

};
