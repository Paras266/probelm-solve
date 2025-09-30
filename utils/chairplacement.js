// utils/chairPlacement.js

export function calculateChairPlacements(params) {
  const {
    shape,
    chairWidth,
    minMargin,
    maxMargin,
    edgeGap = 0.2,
  } = params;

  if (shape === 'circle') {
    const { radius, totalChairs, gap = 1.1 } = params;
    const circumference = 2 * Math.PI * radius;
    const totalChairWidth = totalChairs * chairWidth;
    const totalMargin = circumference - totalChairWidth;

    let margin = totalMargin / totalChairs;
    margin = Math.min(Math.max(margin, minMargin), maxMargin);

    const angleStep = (2 * Math.PI) / totalChairs;
    const placements = [];

    for (let i = 0; i < totalChairs; i++) {
      const angle = i * angleStep;
      const x = gap * radius * Math.cos(angle);
      const z = gap * radius * Math.sin(angle);
      const rotY = Math.PI / 2;
      placements.push({ x, z, rot: rotY });
    }

    return placements;

  } else if (shape === 'rectangle') {
    const {
      tableLength,
      tableWidth,
      totalChairs,
    } = params;

    function clamp(v, a, b) {
      return Math.min(Math.max(v, a), b);
    }

    function capacityForSide(sideLength) {
      const cap = Math.floor((sideLength - minMargin) / (chairWidth + minMargin));
      return Math.max(0, cap);
    }

    function positionsAlongLength(count, z, facingAngle) {
      if (count <= 0) return [];
      const totalChairWidth = count * chairWidth;
      const totalMargin = tableLength - totalChairWidth;
      let margin = totalMargin / (count + 1);
      margin = clamp(margin, minMargin, maxMargin);

      const positions = [];
      for (let i = 0; i < count; i++) {
        const x = -tableLength / 2 + margin * (i + 1) + chairWidth / 2 + i * chairWidth;
        positions.push({ x, z, rot: facingAngle });
      }
      return positions;
    }

    function positionsAlongWidth(count, x, facingAngle) {
      if (count <= 0) return [];
      const totalChairWidth = count * chairWidth;
      const totalMargin = tableWidth - totalChairWidth;
      let margin = totalMargin / (count + 1);
      margin = clamp(margin, minMargin, maxMargin);

      const positions = [];
      for (let i = 0; i < count; i++) {
        const z = -tableWidth / 2 + margin * (i + 1) + chairWidth / 2 + i * chairWidth;
        positions.push({ x, z, rot: facingAngle });
      }
      return positions;
    }

    const capLong = capacityForSide(tableLength);
    const capShort = capacityForSide(tableWidth);

    let remaining = totalChairs;

    const allocLong = Math.min(remaining, 2 * capLong);
    let leftCount = Math.ceil(allocLong / 2);
    let rightCount = allocLong - leftCount;

    leftCount = Math.min(leftCount, capLong);
    rightCount = Math.min(rightCount, capLong);
    remaining -= (leftCount + rightCount);

    const allocShort = Math.min(remaining, 2 * capShort);
    let rightWidthCount = Math.ceil(allocShort / 2);
    let leftWidthCount = allocShort - rightWidthCount;

    rightWidthCount = Math.min(rightWidthCount, capShort);
    leftWidthCount = Math.min(leftWidthCount, capShort);
    remaining -= (rightWidthCount + leftWidthCount);

    const lengthA_z = -(tableWidth / 2 + chairWidth / 2 + edgeGap);
    const lengthB_z = +(tableWidth / 2 + chairWidth / 2 + edgeGap);
    const widthR_x = +(tableLength / 2 + chairWidth / 2 + edgeGap);
    const widthL_x = -(tableLength / 2 + chairWidth / 2 + edgeGap);

    const lengthA_pos = positionsAlongLength(leftCount, lengthA_z, 0);
    const lengthB_pos = positionsAlongLength(rightCount, lengthB_z, Math.PI);
    const widthR_pos = positionsAlongWidth(rightWidthCount, widthR_x, -Math.PI / 2);
    const widthL_pos = positionsAlongWidth(leftWidthCount, widthL_x, Math.PI / 2);

    const placements = [];

    let ia = 0, ib = 0;
    while (ia < lengthA_pos.length || ib < lengthB_pos.length) {
      if (ia < lengthA_pos.length) placements.push(lengthA_pos[ia++]);
      if (ib < lengthB_pos.length) placements.push(lengthB_pos[ib++]);
    }

    let ir = 0, il = 0;
    while (ir < widthR_pos.length || il < widthL_pos.length) {
      if (ir < widthR_pos.length) placements.push(widthR_pos[ir++]);
      if (il < widthL_pos.length) placements.push(widthL_pos[il++]);
    }

    return placements;
  }

  throw new Error('Unknown shape: ' + shape);
}
