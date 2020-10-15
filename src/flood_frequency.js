
var rice = ee.Image("users/anhp/rice2018/rice_quangninh"),
    dbsh_shape = ee.FeatureCollection("users/anhp/DBSH_Shape_10"),
    nhoquan = ee.FeatureCollection("users/anhp/Nho_Quan"),
    chuongmy = ee.FeatureCollection("users/anhp/Chuong_My"),
    quocoai = ee.FeatureCollection("users/anhp/Quoc_Oai"),
    vhh9 = ee.Image("users/anhp/flooded_rice_2018_10_26_VH"),
    vhh8 = ee.Image("users/anhp/flooded_rice_2018_10_2_VH"),
    vhh1 = ee.Image("users/anhp/flooded_rice_2018_7_10_VH"),
    vhh2 = ee.Image("users/anhp/flooded_rice_2018_7_22_VH"),
    vhh4 = ee.Image("users/anhp/flooded_rice_2018_8_15_VH"),
    vhh5 = ee.Image("users/anhp/flooded_rice_2018_8_27_VH"),
    vhh3 = ee.Image("users/anhp/flooded_rice_2018_8_3_VH"),
    vhh7 = ee.Image("users/anhp/flooded_rice_2018_9_20_VH"),
    vhh6 = ee.Image("users/anhp/flooded_rice_2018_9_8_VH"),
    dbsh_rice = ee.Image("users/anhp/dbsh_full_geo_spring_2018"),
    vv1 = ee.Image("users/anhp/flooded_rice_2018_9_8_VV"),
    vv2 = ee.Image("users/anhp/flooded_rice_2018_9_20_VV"),
    vv3 = ee.Image("users/anhp/flooded_rice_2018_8_3_VV"),
    vv4 = ee.Image("users/anhp/flooded_rice_2018_8_27_VV"),
    vv5 = ee.Image("users/anhp/flooded_rice_2018_8_15_VV"),
    vv6 = ee.Image("users/anhp/flooded_rice_2018_7_22_VV"),
    vv7 = ee.Image("users/anhp/flooded_rice_2018_10_2_VV"),
    vv8 = ee.Image("users/anhp/flooded_rice_2018_10_26_VV"),
    vv9 = ee.Image("users/anhp/flooded_rice_2018_7_10_VV"),
    vvvh2 = ee.Image("users/anhp/flood_rice_2018_10_26_VVVH"),
    vvvh3 = ee.Image("users/anhp/flood_rice_2018_10_2_VVVH"),
    vvvh4 = ee.Image("users/anhp/flood_rice_2018_7_10_VVVH"),
    vvvh5 = ee.Image("users/anhp/flood_rice_2018_8_15_VVVH"),
    vvvh6 = ee.Image("users/anhp/flood_rice_2018_8_27_VVVH"),
    vvvh7 = ee.Image("users/anhp/flood_rice_2018_8_3_VVVH"),
    vvvh8 = ee.Image("users/anhp/flood_rice_2018_9_20_VVVH"),
    vvvh9 = ee.Image("users/anhp/flood_rice_2018_9_8_VVVH"),
    vvvh1 = ee.Image("users/anhp/flood_rice_2018_7_22_VVVH"),
    qnn8 = ee.Image("users/anhp/quangninh_flooded_rice_2018-10-12"),
    qnn9 = ee.Image("users/anhp/quangninh_flooded_rice_2018-10-24"),
    qn3 = ee.Image("users/anhp/quangninh_flooded_rice_2018-11-5"),
    qnn2 = ee.Image("users/anhp/quangninh_flooded_rice_2018-7-20"),
    qnn3 = ee.Image("users/anhp/quangninh_flooded_rice_2018-8-1"),
    qnn4 = ee.Image("users/anhp/quangninh_flooded_rice_2018-8-25"),
    qnn6 = ee.Image("users/anhp/quangninh_flooded_rice_2018-9-18"),
    qnn7 = ee.Image("users/anhp/quangninh_flooded_rice_2018-9-30"),
    qnn5 = ee.Image("users/anhp/quangninh_flooded_rice_2018-9-6"),
    qnn1 = ee.Image("users/anhp/quangninh_flooded_rice_2018-7-10"),
    quangninh = ee.FeatureCollection("users/anhp/QuangNinh"),
    dem = ee.Image("users/anhp/dem_2014"),
    dbsh_full = ee.FeatureCollection("users/anhp/DBSH_shape_full"),
    permanent_water = ee.Image("users/anhp/permanent_water_dbsh_refinement_VVVH");

var remove_dem = function(dem_threshold, img){
  //return dem_threshold.not().mask(dem_threshold.not()).and(img.mask(img));
  var refinement = img.expression (
    'i2 + 2*i1', {
      'i1': dem_threshold,
      'i2': img
    })
  var result =  refinement.eq(1);
  return result.mask(result);
}

dem = dem.clip(dbsh_full)

var dem_threshold = dem.select('b1').gt(30);

var dem_threshold_quangninh = dem_threshold.clip(quangninh)

// var freq_summer_rrd_vh = qnn1.expression(
//   'i1 + i2 + i3 + i4 + i5 + i6 + i7',{
//   'i1': remove_dem(dem_threshold_quangninh, qnn1),
//   'i2': remove_dem(dem_threshold_quangninh, qnn2),
//   'i3': remove_dem(dem_threshold_quangninh, qnn3),
//   'i4': remove_dem(dem_threshold_quangninh, qnn4),
//   'i5': remove_dem(dem_threshold_quangninh, qnn5),
//   'i6': remove_dem(dem_threshold_quangninh, qnn6),
//   'i7': remove_dem(dem_threshold_quangninh, qnn7),
//   'i8': remove_dem(dem_threshold_quangninh, qnn8),
//   'i9': remove_dem(dem_threshold_quangninh, qnn9)
// })

// var dem_threshold_rrd_10 = dem_threshold.clip(dbsh_shape)

// var freq_summer_qn_vh = vhh1.expression(
//   'i1 + i2 + i3 + i4 + i5 + i6 + i7',{
//   'i1': remove_dem(dem_threshold_rrd_10,vhh1),
//   'i2': remove_dem(dem_threshold_rrd_10,vhh2),
//   'i3': remove_dem(dem_threshold_rrd_10,vhh3),
//   'i4': remove_dem(dem_threshold_rrd_10,vhh4),
//   'i5': remove_dem(dem_threshold_rrd_10,vhh5),
//   'i6': remove_dem(dem_threshold_rrd_10,vhh6),
//   'i7': remove_dem(dem_threshold_rrd_10,vhh7),
//   'i8': remove_dem(dem_threshold_rrd_10,vhh8),
//   'i9': remove_dem(dem_threshold_rrd_10,vhh9)
// })

var freq_summer_rrd_vh = qnn1.expression(
  'i1 + i2 + i3 + i4 + i5 + i6 + i7',{
  'i1': qnn1.select('b1').clip(quangninh),
  'i2': qnn2.select('b1').clip(quangninh),
  'i3': qnn3.select('b1').clip(quangninh),
  'i4': qnn4.select('b1').clip(quangninh),
  'i5': qnn5.select('b1').clip(quangninh),
  'i6': qnn6.select('b1').clip(quangninh),
  'i7': qnn7.select('b1').clip(quangninh),
  'i8': qnn8.select('b1').clip(quangninh),
  'i9': qnn9.select('b1').clip(quangninh)
})

var dem_threshold_rrd_10 = dem_threshold.clip(dbsh_shape)

var freq_summer_qn_vh = vhh1.expression(
  'i1 + i2 + i3 + i4 + i5 + i6 + i7',{
  'i1': vhh1.select('b1').clip(dbsh_shape),
  'i2': vhh2.select('b1').clip(dbsh_shape),
  'i3': vhh3.select('b1').clip(dbsh_shape),
  'i4': vhh4.select('b1').clip(dbsh_shape),
  'i5': vhh5.select('b1').clip(dbsh_shape),
  'i6': vhh6.select('b1').clip(dbsh_shape),
  'i7': vhh7.select('b1').clip(dbsh_shape),
  'i8': vhh8.select('b1').clip(dbsh_shape),
  'i9': vhh9.select('b1').clip(dbsh_shape)
})


rice = rice.not()

var test = remove_dem(dem_threshold_rrd_10, vhh9)

freq_summer_rrd_vh = ee.ImageCollection.fromImages([freq_summer_rrd_vh, freq_summer_qn_vh]).mosaic()

var agg_permanent_frequency = permanent_water.expression(
  'i2*10 + i1', {
    'i1': freq_summer_rrd_vh,
    'i2': permanent_water
  })
//flood
var agg_permanent_flood_722 = permanent_water.expression(
  'i2*2 + i1', {
    'i1': vhh2.select('b1').clip(dbsh_shape),
    'i2': permanent_water
  })

var agg_permanent_flood_803 = permanent_water.expression(
  'i2*2 + i1', {
    'i1': vhh3.select('b1').clip(dbsh_shape),
    'i2': permanent_water
  })

var agg_permanent_flood_815 = permanent_water.expression(
  'i2*2 + i1', {
    'i1': vhh4.select('b1').clip(dbsh_shape),
    'i2': permanent_water
  })
//flooded rice
rice = dbsh_rice.not().clip(dbsh_shape)
var agg_rice_flood_722 = vhh2.expression(
  'i2*2 + i1', {
    'i1': vhh2.select('b1').clip(dbsh_shape),
    'i2': rice
  })

var agg_rice_flood_803 = vhh3.expression(
  'i2*2 + i1', {
    'i1': vhh3.select('b1').clip(dbsh_shape),
    'i2': rice
  })

var agg_rice_flood_815 = vhh4.expression(
  'i2*2 + i1', {
    'i1': vhh4.select('b1').clip(dbsh_shape),
    'i2': rice
  })  
// Map.addLayer(dbsh_rice.not().mask(dbsh_rice.not()), {palette: 'green'},'dbsh_rice');

// Map.addLayer(test.mask(test), {palette: 'green'},'dem');

// Map.addLayer(dem_threshold.mask(dem_threshold), {palette: 'red'},'dem2');

// Map.addLayer(agg_permanent_frequency.mask(agg_permanent_frequency), {min: 1, max: 10,
// palette: ['blue','blue','blue','yellow', 'yellow', 'red', 'red', 'red', 'red', 'green']},'freq_summer_rrd_vh');

Map.addLayer(agg_permanent_flood_722.mask(agg_permanent_flood_722), {min: 1, max: 2,
palette: ['red', 'green']},'agg_permanent_flood_722');

Map.addLayer(agg_permanent_flood_803.mask(agg_permanent_flood_803), {min: 1, max: 2,
palette: ['red', 'green']},'agg_permanent_flood_803');

Map.addLayer(agg_permanent_flood_815.mask(agg_permanent_flood_815), {min: 1, max: 2,
palette: ['red', 'green']},'agg_permanent_flood_815');
//flood rice
Map.addLayer(agg_rice_flood_722.mask(agg_rice_flood_722), {min: 1, max: 3,
palette: ['blue', 'green', 'orange']},'agg_rice_flood_722');

Map.addLayer(agg_rice_flood_803.mask(agg_rice_flood_803), {min: 1, max: 3,
palette: ['blue', 'green', 'orange']},'agg_rice_flood_803');

Map.addLayer(agg_rice_flood_815.mask(agg_rice_flood_815), {min: 1, max: 3,
palette: ['blue', 'green', 'orange']},'agg_rice_flood_815');

Export.image.toDrive({
      image: agg_permanent_frequency.mask(agg_permanent_frequency),
      description: 'agg_permanent_frequency',
      scale: 10,
      folder:'FloodingRice',
      region: dbsh_full.geometry().bounds(),
      maxPixels: 1000000000000
});
//flood-permanent
Export.image.toDrive({
      image: agg_permanent_flood_722.mask(agg_permanent_flood_722),
      description: 'agg_permanent_flood_722',
      scale: 10,
      folder:'FloodingRice',
      region: dbsh_shape,
      maxPixels: 1000000000000
});

Export.image.toDrive({
      image: agg_permanent_flood_803.mask(agg_permanent_flood_803),
      description: 'agg_permanent_flood_803',
      scale: 10,
      folder:'FloodingRice',
      region: dbsh_shape,
      maxPixels: 1000000000000
});

Export.image.toDrive({
      image: agg_permanent_flood_815.mask(agg_permanent_flood_815),
      description: 'agg_permanent_flood_815',
      scale: 10,
      folder:'FloodingRice',
      region: dbsh_shape,
      maxPixels: 1000000000000
});
//rice-flood
Export.image.toDrive({
      image: agg_rice_flood_722.mask(agg_rice_flood_722),
      description: 'agg_rice_flood_722',
      scale: 10,
      folder:'FloodingRice',
      region: dbsh_shape,
      maxPixels: 1000000000000
});

Export.image.toDrive({
      image: agg_rice_flood_803.mask(agg_rice_flood_803),
      description: 'agg_rice_flood_803',
      scale: 10,
      folder:'FloodingRice',
      region: dbsh_shape,
      maxPixels: 1000000000000
});

Export.image.toDrive({
      image: agg_rice_flood_815.mask(agg_rice_flood_815),
      description: 'agg_rice_flood_815',
      scale: 10,
      folder:'FloodingRice',
      region: dbsh_shape,
      maxPixels: 1000000000000
});