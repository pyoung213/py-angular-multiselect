(function() {
  'use strict';

  angular
    .module('pyAngularMultiselect')
    .run(runBlock);

  /** @ngInject */
  function runBlock($log) {

    $log.debug('runBlock end');
  }

})();
