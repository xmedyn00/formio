const applySelectBoxesAnoNe = require('./selectBoxesAnoNe');

module.exports = function handleC62(body) {

  applySelectBoxesAnoNe(body, {
	  key: 'c2_pripravaTepleVody',
	  values: [
		{ value: 'pripravaTepleVody' }
	  ]
	});

};

