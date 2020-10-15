
var rice_quangninh = ee.Image("users/anhp/rice2018/rice_quangninh"),
    permanent = ee.Image("users/anhp/quangninh_permanent_rrd_VH");
//import shapefile DBSH
var dbsh_shape_ = ee.FeatureCollection('users/anhp/QuangNinh');
Map.centerObject(dbsh_shape_);
Map.addLayer(dbsh_shape_, {color: 'white'});

var flood_rice_Col1 = ee.ImageCollection('COPERNICUS/S1_GRD')
    .filterBounds(dbsh_shape_)
    .filterDate('2018-7-8', '2018-7-11')
    .filter(ee.Filter.eq('relativeOrbitNumber_start', 55));
    
    
var flood_rice_Col1_clip = flood_rice_Col1.map(function(image) {return image.clip(dbsh_shape_);});

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

var histogram_flood_img = flood_img_clip.select('VH').reduceRegion({
  reducer: ee.Reducer.histogram(255, 2)
      .combine('mean', null, true)
      .combine('variance', null, true), 
  geometry: dbsh_shape_, 
  scale: 10,
  bestEffort: true
});


var threshold_flood = (otsu(histogram_flood_img.get('VH_histogram')));
console.log(threshold_flood)

var class_rt_water_flood = flood_img_clip.select('VH').lt(threshold_flood);

var flood_sbtr_permanent = class_rt_water_flood.and(permanent.not());

var kernel = ee.Kernel.circle(1);
var flood_permanent = flood_sbtr_permanent
            .focal_max({kernel: kernel, iterations: 1})
            .focal_min({kernel: kernel, iterations: 3})
            .focal_max({kernel: kernel, iterations: 1});
var water = class_rt_water_flood
            .focal_max({kernel: kernel, iterations: 1})
            .focal_min({kernel: kernel, iterations: 3})
            .focal_max({kernel: kernel, iterations: 1});

var rice = rice_quangninh.not();

var flooded_rice = flood_permanent.mask(flood_permanent).and(rice.mask(rice));

// var histogram = ui.Chart.image.histogram(flood_img_clip.select('VH'), dbsh_shape_, 30);
// print (histogram)

// Map.addLayer(class_dry.mask(class_dry), { palette: 'red'}, 'rice');
Map.addLayer(rice.mask(rice), {palette: 'yellow'}, 'rice');
Map.addLayer(flooded_rice, {palette: 'blue'}, 'flooded_rice');
Map.addLayer(permanent.mask(permanent), {palette: 'blue'}, 'permanent_water');

Export.image.toDrive({
      image: flooded_rice.mask(flooded_rice).clip(dbsh_shape_),
      description: 'quangninh_flooded_rice_2018-7-10',
      scale: 10,
      folder:'FloodingRice',
      region: dbsh_shape_,
      maxPixels: 1000000000000
});