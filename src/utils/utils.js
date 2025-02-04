const twoPointDistance = ({ lat: lat1, lon: lon1 }, { lat: lat2, lon: lon2 }) => (((lat1 - lat2) * 111) ** 2 + ((lon1 - lon2) * 101) ** 2) ** 0.5;
const twoSideDistance = (side1, side2) => (side1 ** 2 + side2 ** 2) ** 0.5;
const pga = (magnitde, distance, siteEffect = 1.751) => 1.657 * Math.pow(Math.E, (1.533 * magnitde)) * Math.pow(distance, -1.607) * (siteEffect ?? 1.751);

const formatTime = (timestamp) => {
	const date = new Date(timestamp);
	const year = date.getFullYear();
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const day = date.getDate().toString().padStart(2, "0");
	const hours = date.getHours().toString().padStart(2, "0");
	const minutes = date.getMinutes().toString().padStart(2, "0");
	const seconds = date.getSeconds().toString().padStart(2, "0");

	return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
};

module.exports = {
	twoPointDistance,
	twoSideDistance,
	pga,
	formatTime,
};