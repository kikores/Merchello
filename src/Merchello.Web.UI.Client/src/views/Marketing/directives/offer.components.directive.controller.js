/**
 * @ngdoc controller
 * @name Merchello.Directives.OfferComponentsDirectiveController
 * @function
 *
 * @description
 * The controller to handle offer component association and configuration
 */
angular.module('merchello').controller('Merchello.Directives.OfferComponentsDirectiveController',
    ['$scope', 'notificationsService', 'dialogService', 'eventsService', 'marketingResource', 'offerComponentDefinitionDisplayBuilder',
    function($scope, notificationsService, dialogService, eventsService, marketingResource, offerComponentDefinitionDisplayBuilder) {

        $scope.componentsLoaded = false;
        $scope.availableComponents = [];
        $scope.assignedComponents = [];

        // exposed components
        $scope.assignComponent = assignComponent;
        $scope.removeComponentOpen = removeComponentOpen;

        var eventName = 'merchello.offercomponentcollection.changed';

        function init() {
            eventsService.on('merchello.offercomponentcollection.changed', onComponentCollectionChanged);

            $scope.$watch('preValuesLoaded', function(pvl) {
                console.info(pvl);
                if(pvl === true) {
                    loadComponents();
                }
            });
        }

        function loadComponents() {
            // either assigned constraints or rewards
            $scope.assignedComponents = _.filter($scope.offerSettings.componentDefinitions, function(osc) { return osc.componentType === $scope.componentType; });
            var typeGrouping = $scope.offerSettings.getComponentsTypeGrouping();
            console.info(typeGrouping);
            $scope.availableComponents = _.filter($scope.components, function(c) {
                var ac = _.find($scope.assignedComponents, function(ac) { return ac.componentKey === c.componentKey; });
                if (ac === undefined && c.componentType === $scope.componentType && (typeGrouping === '' | typeGrouping === c.typeGrouping)) {
                    return c;
                }
            });

            $scope.componentsLoaded = true;
        }



        function assignComponent(component) {
            var assertComponent = _.find($scope.offerSettings.componentDefinitions, function(cd) { return cd.componentKey === component.componentKey; });
            if (assertComponent === undefined && $scope.offerSettings.ensureTypeGrouping(component.typeGrouping)) {
                $scope.offerSettings.componentDefinitions.push(component);
                //loadComponents();
                eventsService.emit(eventName);
            }
        }


        function removeComponentOpen(component) {
                var dialogData = {};
                dialogData.name = 'Component: ' + component.name;
                dialogData.componentKey = component.componentKey;
                if(!component.extendedData.isEmpty()) {
                    dialogData.warning = 'This will any delete any configurations for this component if saved.';
                }

                dialogService.open({
                    template: '/App_Plugins/Merchello/Backoffice/Merchello/Dialogs/delete.confirmation.html',
                    show: true,
                    callback: processRemoveComponent,
                    dialogData: dialogData
                });
        }

        function processRemoveComponent(dialogData) {
            $scope.offerSettings.componentDefinitions = _.reject($scope.offerSettings.componentDefinitions, function(cd) { return cd.componentKey === dialogData.componentKey; })
            //loadComponents();
            eventsService.emit(eventName);
        };

        function onComponentCollectionChanged() {
            console.info('change called');
            loadComponents();
        }
        // Initialize the controller
        init();
    }]);