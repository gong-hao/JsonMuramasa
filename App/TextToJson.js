/// <reference path="/Scripts/angular.js" />

$(document).foundation();

angular.module(
    'app',
    []
).controller(
    'textToJsonCtrl',
    [
        '$scope',
        function (
            $scope
        ) {
            function clearEmpty(arr) {
                if (!$scope.IsClearEmpty) {
                    return arr;
                }

                var result = [];

                angular.forEach(arr, function (item) {
                    if (item !== '') {
                        result.push(item);
                    }
                });

                return result;
            }

            function runLine(isPick) {
                var lines = $scope.TextInputEditor.split(/\n/g);

                var result = '';

                angular.forEach(lines, function (line, index) {
                    var hasKey = $scope.IsEqual ?
                        line == $scope.KeyWord :
                        line.indexOf($scope.KeyWord) != -1;

                    if ((isPick && hasKey) || (!isPick && !hasKey)) {
                        result += line + '\n';
                    }
                });

                $scope.JsonResultEditor = result;
            }

            $scope.IsClearEmpty = true;

            $scope.TextInputEditor = '';

            $scope.JsonResultEditor = '';

            $scope.AxisSwapSp = '';

            $scope.SplitPat = '[ |	|,]';

            $scope.IsEqual = false;

            $scope.IsAutoColumnName = false;

            $scope.KeyWord = '';

            $scope.HanSoldierskey = '';

            $scope.TextToJson = function () {
                var lines = $scope.TextInputEditor.split(/\n/g);

                var result = '';

                var fields = [];

                result += '{\n';

                result += '  "data" : [\n';

                angular.forEach(lines, function (line, index) {
                    var pat = new RegExp($scope.SplitPat, 'g');

                    var arr = clearEmpty(line.split(pat));

                    if ($scope.IsAutoColumnName) {
                        if (arr.length <= 26) {
                            fields = 'abcdefghijklmnopqrstuvwxyz'.split('').slice(0, arr.length);
                        } else {
                            for (var i = 0; i < arr.length; i++) {
                                fields.push('c' + (i + 1));
                            }
                        }
                    }
                    
                    if (!$scope.IsAutoColumnName && index === 0) {
                        fields = arr;
                    } else {
                        var current = '    ';

                        current += '{ ';

                        angular.forEach(arr, function (item, i) {
                            current += '"' + fields[i] + '" : "' + item + '"';
                            if (i != arr.length - 1) {
                                current += ', ';
                            }
                        });

                        current += ' }';

                        if (index != lines.length - 1) {
                            current += ', ';
                        }

                        current += '\n';

                        result += current;
                    }
                });

                result += '  ]\n';

                result += '}\n';

                $scope.JsonResultEditor = result;
            };

            $scope.AxisSwap = function () {
                var sp = '\t';

                if ($scope.AxisSwapSp.length > 0) {
                    sp = $scope.AxisSwapSp;
                }

                var lines = $scope.TextInputEditor.split(/\n/g);

                var all = [];

                var x_length = 0;

                angular.forEach(lines, function (line) {
                    var arr = clearEmpty(line.split(/[\s|\t|,]/g));

                    x_length = arr.length;

                    all.push(arr);
                });

                var result = '';

                for (var j = 0; j < x_length; j++) {
                    var current = '';

                    for (var i = 0; i < all.length; i++) {
                        current += all[i][j];

                        if (i != all.length - 1) {
                            current += sp;
                        }
                    }

                    current += '\n';

                    result += current;
                }

                $scope.JsonResultEditor = result;
            };

            $scope.Exclude = function () {
                runLine(false);
            };

            $scope.Pick = function () {
                runLine(true);
            };

            $scope.HanSoldiers = function () {
                var key = $scope.HanSoldierskey.split(',');

                var group = parseInt(key[0], 10);

                var target = 0;

                var hasTarget = key.length === 2;

                if (hasTarget) {
                    target = parseInt(key[1], 10);
                }

                var lines = $scope.TextInputEditor.split(/\n/g);

                var result = '';

                for (var i = 0; i < lines.length; i += group) {
                    if (hasTarget) {
                        result += lines[i + target] + '\n';
                    } else {
                        for (var j = i; j < i + group; j++) {
                            result += ((j === i) ? '' : '\t') + lines[j];
                        }

                        result += '\n';
                    }
                }

                $scope.JsonResultEditor = result;
            };
        }
    ]
);