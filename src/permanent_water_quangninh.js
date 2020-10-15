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
    
    return means.sort(bss).get([-1]);
};   

var dbsh_shape_ = ee.FeatureCollection('users/anhp/QuangNinh');
var channel = 'VVVH'

var histogram = function (dry_img, channel) {
  return dry_img.select(channel).reduceRegion({
  reducer: ee.Reducer.histogram(255, 2)
      .combine('mean', null, true)
      .combine('variance', null, true), 
  geometry: dbsh_shape_, 
  scale: 10,
  bestEffort: true
});};

var mosaic_image = function (col, channel) {
  var colList = col.toList(500).splice(30, 4)
  var col_length = colList.size().getInfo()
  var array_img = []
  var mosaic = ee.Image()
  var img1 = ee.Image()
  var img2 = ee.Image()
  for (var i = 0; i < col_length - 1 ; i = i+2) {
    img1 = ee.Image(colList.get(i))
    img2 = ee.Image(colList.get(i+1))
    var id = img1.id().getInfo()
    mosaic = ee.ImageCollection.fromImages([img1, img2]).mosaic().select(channel)
    // var hstg = ui.Chart.image.histogram(mosaic.select(channel), dbsh_shape_, 50);
    // print (hstg)
    var threshold_dry = (otsu(histogram(mosaic, channel).get(channel.concat('_histogram'))));
    // print (threshold_dry)
    var class_dry = mosaic.select(channel).lt(threshold_dry);
    array_img.push(class_dry)
    // Map.addLayer(mosaic,{bands: ['VH']}, mosaic.id().getInfo())
    //export2drive(mosaic.clip(shape), 'LS8-S1A', 10, id, shape, 10000000000000)
    img2 = ee.Image();
  }
  
  return array_img;
};


// main
var dry_Col = ee.ImageCollection('COPERNICUS/S1_GRD')
    .filterBounds(dbsh_shape_)
    .filterDate('2018-1-1', '2018-12-31')
    .filter(ee.Filter.eq('relativeOrbitNumber_start', 55));

// var dry_col_clip = dry_Col.map(function(image) {return image.clip(dbsh_shape_);});

var dry_col_clip = dry_Col.map(function(image) {
  var vh = image.select('VV');
  var vv = image.select('VH');
  var vvvh = vv.add(vh).rename('VVVH');
  return vvvh.clip(dbsh_shape_);
});

var dry_col_mosaic = mosaic_image(dry_col_clip, channel);

console.log(dry_Col)

var result_img = dry_col_mosaic[0]
for (var i = 1; i < dry_col_mosaic.length; i = i+1){
  result_img = result_img.expression(
  'i1 + i2',{
  'i1': result_img.select(channel).clip(dbsh_shape_),
  'i2': dry_col_mosaic[i].select(channel).clip(dbsh_shape_),
})}


console.log(result_img);
var result_img = result_img.select(channel).gt(27);
Map.addLayer(result_img.mask(result_img), {palette: 'blue'}, 'permanent_water_qn');

Export.image.toDrive({
      image: result_img.mask(result_img),
      description: 'quangninh_permanent_rrd_'.concat(channel),
      scale: 10,
      folder:'Permanent-water',
      region: dbsh_shape_,
      maxPixels: 1000000000000
});