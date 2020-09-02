import { LightningElement, api, wire } from "lwc";
import leaflet from "@salesforce/resourceUrl/leaflet";
import { getRecord, updateRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { loadScript, loadStyle } from "lightning/platformResourceLoader";
// https://developer.salesforce.com/docs/component-library/documentation/lwc/lwc.data_wire_service_about
// Locations can be imported using @salesforce/schema/Bear__c.Location__Latitude__s
const fields = ["Bear__c.Location__Latitude__s", "Bear__c.Location__Longitude__s"];

export default class InteractiveMap extends LightningElement {
	map;
	location;
	leafletInitialized = false;
	@api recordId;

	@wire(getRecord, { recordId: "$recordId", fields })
	loadBear({ error, data }) {
		if (error) {
			// TODO: handle error
		} else if (data) {
			// Get Bear data
			this.location = [data.fields.Location__Latitude__s.value, data.fields.Location__Longitude__s.value];
			this.initializeMap();
		}
	}

	initializeMap() {
		if (this.leafletInitialized) {
			return;
		}
		this.leafletInitialized = true;

		let promises = [];
		promises.push(loadScript(this, leaflet + "/leaflet.js"));
		promises.push(loadStyle(this, leaflet + "/leaflet.css"));
		Promise.all(promises)
			.then(() => {
				// eslint-disable-next-line no-undef
				const leafMap = L; // L is exported from leaflet.js
				const urlTemplate = "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
				const options = {
					attribution: '<a href="http://openstreetmap.org">OpenStreetMap</a>',
					maxZoom: 18
				};

				// Create map
				const mapid = this.template.querySelector(".mapid");
				this.map = leafMap.map(mapid);
				this.map.setView(this.location, 13);
				leafMap.tileLayer(urlTemplate, options).addTo(this.map);

				// Create marker
				let marker = leafMap.marker(this.location, { draggable: "true" }); //.addTo(this.map);
				this.map.addLayer(marker);
				marker.on("dragend", event => {
					let newLocation = event.target;
					var newCoord = newLocation.getLatLng();
					this.updateCoordinate(newCoord.lat, newCoord.lng);
					newLocation.setLatLng(new leafMap.LatLng(newCoord.lat, newCoord.lng), { draggable: "true" });
				});
			})
			.catch(error => {
				this.dispatchEvent(
					new ShowToastEvent({
						title: "Error loading",
						message: error.message,
						variant: "error"
					})
				);
			});
	}

	async updateCoordinate(lat, lng) {
		try {
			const recordInput = {
				fields: {
					Id: this.recordId,
					Location__Latitude__s: lat,
					Location__Longitude__s: lng
				}
			};
			await updateRecord(recordInput);
			this.showToast("Success", "Bear location updated", "success");
		} catch (error) {
			this.showToast("Error updating record", error.message, "error");
		}
	}

	showToast(title, message, variant) {
		this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
	}
}
