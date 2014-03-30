var LOG, controllers, models;
var Q = require('q');
var merge = require('merge');

module.exports = function SnapshotFactory(){

    var init = function init(LOG_in, models_in, controllers_in){
        LOG = LOG_in;
        models = models_in;
        controllers = controllers_in;
        LOG.info("Snapshot Factory Initialized");
    };

    var build = function build(properties, pageId){
        LOG.info("Building Snapshot");
        //LOG.info("properties", properties);
        if(!controllers && !models){
            throw new Error("Factory must be initialized first");
        }

        var page, snapshotRaw, snapshot, image;


        return controllers.pages.findById(pageId)
            .then(function(thePage){
                page = thePage;
                return controllers.charybdis.webPageToSnapshot(page.url, 800, 800);
            })
            .then(function(snapshotResult){
                LOG.info('Charybdis captured screenshot');
                snapshotRaw = merge(properties,snapshotResult);
                var imageProperties = {
                    width:800,
                    height:800,
                    info:snapshotRaw.image.info
                };
                var fileContents = snapshotRaw.image.contents;
                delete snapshotRaw.image;

                return controllers.images.createSnapshot(imageProperties, pageId, fileContents)
            })
            .then(function(theImage){
                LOG.info('Image created for snapshot');
                image = theImage;
                snapshotRaw.state = "Complete";
                return controllers.shared.buildAndValidateModel(models.Snapshot, snapshotRaw)
            })
            .then(function(theSnapshot){
                LOG.info('Snapshot created, saving ancillary models ');
                snapshot = theSnapshot;
                page.addSnapshot(snapshot);
                snapshot.setPage(page);
                snapshot.setImage(image);
                image.setSnapshot(snapshot);
                return Q.all([
                        snapshot.save(),
                        image.save(),
                        page.save()
                ])
            })
            .then(function(){
                return snapshot;
            })
            .fail(function(error){
                LOG.error("Error in SnapshotFactory.build", error);
            });



    };

    return {
        init:init,
        build:build
    };
}();