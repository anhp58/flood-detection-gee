
// --------------import rice map and dem map---------------------
// var dbsh_rice = ...
// var dem = ...
var dbsh_rice = ee.Image("users/anhp/dbsh_full_geo_spring_2018"),
    dem = ee.Image("users/anhp/dem_2014");
// -----------------------------------

//import shapefile DBSH
var dbsh_shape_ = ee.FeatureCollection('users/anhp/DBSH_Shape_10');
Map.centerObject(dbsh_shape_);
Map.addLayer(dbsh_shape_, {color: 'white'});
// permanent water
var permanent_water = ee.Image('users/anhp/permanent_water_dbsh_refinement_VVVH');

var flood_rice_Col1 = ee.ImageCollection('COPERNICUS/S1_GRD')
    .filterBounds(dbsh_shape_)
    .filterDate('2018-7-18', '2018-7-23')
    .filter(ee.Filter.eq('relativeOrbitNumber_start', 91));

var channel = 'VH'
console.log(flood_rice_Col1)
    
var flood_rice_Col1_clip = flood_rice_Col1.map(function(image) {return image.clip(dbsh_shape_);});

// var flood_rice_Col1_clip = flood_rice_Col1.map(function(image) {
//   var vh = image.select('VV');
//   var vv = image.select('VH');
//   var vvvh = vv.add(vh).rename('VVVH');
//   return vvvh.clip(dbsh_shape_);
// });


var flood_img_clip = flood_rice_Col1_clip.mosaic();


var otsu = function(histogram) {
    var counts = ee.Array(ee.Dictionary(histogram).get('histogram'));
    var means = ee.Array(ee.Dictionary(histogram).get('bucketMeans'));
    var size = means.length().get([0]);
    var total = counts.reduce(ee.Reducer.sum(), [0]).get([0]);
    var sum = means.multiply(counts).reduce(ee.Reducer.sum(), [0]).get([0]);
    var mean = sum.divide(total);
    var indices = ee.List.sequence(1, size);
    
    var bss = indices.map(function(i) {
        var aCounts = counts.slice(0, 0, i);

        var aCount = aCounts.reduce(ee.Reducer.sum(), [0]).get([0]);

        var aMeans = means.slice(0, 0, i);

        var aMean = aMeans.multiply(aCounts)
              .reduce(ee.Reducer.sum(), [0]).get([0])
              .divide(aCount);

        var bCount = total.subtract(aCount);

        var bMean = sum.subtract(aCount.multiply(aMean)).divide(bCount);
        return aCount.multiply(aMean.subtract(mean).pow(2)).add(
                bCount.multiply(bMean.subtract(mean).pow(2)));
    });
    console.log(bss)
    print(ui.Chart.array.values(ee.Array(bss), 0, means));
    
    return means.sort(bss).get([-1]);
};

var histogram_flood_img = flood_img_clip.select(channel).reduceRegion({
  reducer: ee.Reducer.histogram(255, 2)
      .combine('mean', null, true)
      .combine('variance', null, true), 
  geometry: dbsh_shape_, 
  scale: 10,
  bestEffort: true
});

// var histogram = ui.Chart.image.histogram(flood_img_clip.select('VH'), dbsh_shape_, 100);
// print (histogram)

var threshold_flood = (otsu(histogram_flood_img.get(channel.concat('_histogram'))));

console.log(threshold_flood)

var class_rt_water_flood = flood_img_clip.select(channel).lt(threshold_flood);


var flood_sbtr_permanent = class_rt_water_flood.and(permanent_water.not());

var kernel = ee.Kernel.circle(1);
var flood_permanent = flood_sbtr_permanent
            .focal_max({kernel: kernel, iterations: 1})
            .focal_min({kernel: kernel, iterations: 3})
            .focal_max({kernel: kernel, iterations: 1});
            
//dem            
dem = dem.clip(dbsh_shape_)
var dem_threshold = dem.select('b1').gt(30);
//dem
flood_permanent = dem_threshold.not().mask(dem_threshold.not()).and(flood_permanent.mask(flood_permanent));

var rice = dbsh_rice.not();

var flooded_rice = flood_permanent.mask(flood_permanent).and(rice.mask(rice));
console.log(flood_permanent);

var agg_result = ee.Image().expression(
  'i1 + 2*i2',{
  'i1': flood_permanent.select('b1'),
  'i2': permanent_water.select('b1'),
});





Map.addLayer(flood_permanent.mask(flood_permanent), {min: 1, max: 1, palette: ['blue', 'red', 'red']}, 'flood_permanent');


Export.image.toDrive({
      image: agg_result.mask(agg_result),
      description: 'DBSH10_flood_815_'.concat(channel),
      scale: 10,
      folder:'FloodingRice',
      region: dbsh_shape_,
      maxPixels: 1000000000000
});

// Map.addLayer(agg_result.mask(agg_result), {min: 1, max: 3, palette: ['yellow','blue','red']}, 'rice');
// Map.addLayer(rice.mask(rice), {palette: 'yellow'}, 'rice');
// Map.addLayer(flood_permanent.mask(flood_permanent), {palette: 'yellow'}, 'flood_permanent');
// Map.addLayer(flooded_rice.mask(flooded_rice), {palette: 'red'}, 'flooded_rice');
// Map.addLayer(permanent_water.mask(permanent_water), {palette: 'blue'}, 'water');

// var base_dir_shp = "users/anhp/SHP_HUYEN/"
// var list_shp = []


// for (var i = 1; i <= 177; i++) {
//   list_shp.push(base_dir_shp.concat(i))
// }
// console.log(list_shp);