
var initControllers = function initControllers(LOG, models, imagePath){

    var controllers = {
        shared          : require('./commonController')         (LOG),
        suites          : require('./suitesController')         (LOG, models),
        suiteRuns       : require('./suiteRunsController')      (LOG, models),
        masterSnapshots : require('./masterSnapshotsController')(LOG, models),
        pages           : require('./pagesController')          (LOG, models),
        snapshots       : require('./snapshotsController')      (LOG, models),
        charybdis       : require('./charybdisController')      (LOG, models),
        images          : require('./imagesController')         (LOG, models, imagePath)
    };
    controllers.factories = {
        snapshot        : require('./factories/snapshotFactory'),
        diff            : require('./factories/snapshotDiffFactory'),
        suiteRun        : require('./factories/suiteRunFactory')
    };

    controllers.factories.snapshot.init     (LOG, models, controllers);
    controllers.factories.diff.init         (LOG, models, controllers);
    controllers.factories.suiteRun.init     (LOG, models, controllers);

    return controllers;
};
module.exports = initControllers;