export function frameFit(width,height,targetWidth,targetHeight) {
  if(![width,height,targetWidth,targetHeight].every(v=>Number.isFinite(v)&&v>0))throw new Error('Use positive dimensions.');
  const sourceRatio=width/height, targetRatio=targetWidth/targetHeight;
  const cropWidth=Math.min(width,height*targetRatio);
  const cropHeight=Math.min(height,width/targetRatio);
  return {cropWidth,cropHeight,cropLeft:(width-cropWidth)/2,cropTop:(height-cropHeight)/2,retainedPercent:100*(cropWidth*cropHeight)/(width*height),sameRatio:Math.abs(sourceRatio-targetRatio)<0.001};
}
