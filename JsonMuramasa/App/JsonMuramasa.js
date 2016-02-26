/// <reference path="/Scripts/angular.js" />

$(document).foundation();

angular
    .module('app', [])
    .controller('mainCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {
        $scope.JsonEditorColumn = 4;

        $scope.TemplateEditorColumn = 4;

        $scope.ResultEditorColumn = 4;

        $scope.download = function download() {
            var result = $('#ResultEditor').val();

            $.ajax({
                url: '/Api/JsonMuramasa/Download',
                type: 'POST',
                data: { result: result },
                success: function (success) {
                    if (success) {
                        location.href = '/Zip/Download.zip';
                    }
                }
            });
        };

        $scope.execute = function execute() {
            var script = $('#FuntionEditor').val();

            if (script !== '') {
                eval('var fnObj = ' + script + ';');

                $.extend($scope, fnObj);
            }

            var jsonEditor = $('#JsonEditor').val();

            var templateEditor = $('#TemplateEditor').val();

            if (jsonEditor === '' || templateEditor === '') {
                return false;
            }

            var data = TryGetJson(jsonEditor);

            if (!angular.isDefined(data)) {
                return false;
            }

            $rootScope.$broadcast(
                'chopping',
                {
                    Data: data,
                    Template: templateEditor
                }
            );

            setTimeout(function () {
                var checkRender = setInterval(function () {
                    if ($('#chopping-blocks').text().trim().length > 0) {
                        $('#ResultEditor').val($('#chopping-blocks').text());

                        clearInterval(checkRender);
                    }
                }, 50);
            });
        };

        $scope.pretty = function pretty() {
            $('#JsonEditor').format({ method: 'json' });
        };

        $scope.validate = function validate() {
            var jsonEditor = $('#JsonEditor').val();

            if (jsonEditor === '') {
                return false;
            }

            TryGetJson(jsonEditor);
        };

        function TryGetJson(json) {
            var data;

            try {
                data = JSON.parse(json);
            } catch (e) {
                console.log(e);

                alert('Json not valid.');
            }

            return data;
        }
    }])
    .directive('choppingBlock', ['templateSvc', function (templateSvc) {
        return {
            scopr: false,
            restrict: 'A,E',
            template: '<show-block ng-repeat="block in Blocks"></show-block>',
            controller: [
                '$scope',
                function ($scope) {
                    $scope.Blocks = [];

                    $scope.Template = '';

                    $scope.$on('chopping', function (event, args) {
                        if (angular.isDefined(args.Data)) {
                            $scope.Template = templateSvc.translate(args.Template);

                            $scope.Blocks = [];

                            $scope.Blocks.push(args.Data);
                        }
                    });

                    $scope.if = function (predicates, then, otherwise) {
                        var isNeedfillSpace = !angular.isString(otherwise) && otherwise === true;

                        if (isNeedfillSpace) {
                            otherwise = $scope.copy(' ', then.length);
                        }

                        return predicates ? then : otherwise;
                    };

                    $scope.ifNot = function (predicates, then, otherwise) {
                        var isNeedfillSpace = !angular.isString(otherwise) && otherwise === true;

                        if (isNeedfillSpace) {
                            otherwise = $scope.copy(' ', then.length);
                        }

                        return predicates ? otherwise : then;
                    };

                    $scope.isFirst = function (then, otherwise) {
                        return $scope.if(this.$first, then, otherwise);
                    };

                    $scope.isNotFirst = function (then, otherwise) {
                        return $scope.ifNot(this.$first, then, otherwise);
                    };

                    $scope.isLast = function (then, otherwise) {
                        return $scope.if(this.$last, then, otherwise);
                    };

                    $scope.isNotLast = function (then, otherwise) {
                        return $scope.ifNot(this.$last, then, otherwise);
                    };

                    $scope.isEven = function (then, otherwise) {
                        return $scope.if(this.$even, then, otherwise);
                    };

                    $scope.isNotEven = function (then, otherwise) {
                        return $scope.ifNot(this.$even, then, otherwise);
                    };

                    $scope.isOdd = function (then, otherwise) {
                        return $scope.if(this.$odd, then, otherwise);
                    };

                    $scope.isNotOdd = function (then, otherwise) {
                        return $scope.ifNot(this.$odd, then, otherwise);
                    };

                    $scope.isMiddle = function (then, otherwise) {
                        return $scope.if(this.$middle, then, otherwise);
                    };

                    $scope.isNotMiddle = function (then, otherwise) {
                        return $scope.ifNot(this.$middle, then, otherwise);
                    };

                    $scope.copy = function (val, times) {
                        var result = '';

                        for (var i = 0; i < times; i++) {
                            result += val;
                        }

                        return result;
                    };

                    $scope.toJson = function (val, pretty) {
                        return angular.toJson(val, pretty);
                    };
                }
            ]
        };
    }])
    .directive('showBlock', ['$compile', function ($compile) {
        return {
            scopr: false,
            restrict: 'A,E',
            link: function (scope, element, attrs, tabsCtrl) {
                angular.extend(scope, scope.block);

                var linkFn = $compile(scope.$parent.Template);

                var content = linkFn(scope);

                element.append(content);
            }
        };
    }])
    .service('templateSvc', [function () {
        var templateSvc = {};

        templateSvc.translate = function (template) {
            var result = '<pre>';

            var arr = template.split(/\n/g);

            angular.forEach(arr, function (item, index) {
                item = item.trim();

                var statements = item.split(' ');

                var isText = item.indexOf('#') === 0;

                var isIf = !isText && item.indexOf('if') === 0;

                var isIn = !isText && statements.length === 3 && statements[1] === 'in';

                var isEnd = item.indexOf('end') === 0;

                var line = '';

                if (isText) {
                    var lineWithoutHash = item.substring(1, item.length);

                    line = $('<div/>').text(lineWithoutHash).html() + '\n';
                } else if (isEnd) {
                    line = '</span>';
                } else if (isIn) {
                    line = '<span ng-repeat="' + statements[0] + ' in ' + statements[2] + ' track by $index">';
                } else if (isIf) {
                    var lineWithoutIf = item.substring(3, item.length);

                    if (lineWithoutIf.length > 0) {
                        line = '<span ng-if="' + lineWithoutIf + '">';
                    }
                }

                result += line;
            });

            result += '</pre>';

            return result;
        };

        return templateSvc;
    }]);