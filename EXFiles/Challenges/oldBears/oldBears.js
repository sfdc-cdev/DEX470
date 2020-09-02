import { LightningElement, wire } from 'lwc';
import getOldBears from '@salesforce/apex/BearController.getOldBears';

export default class OldBears extends LightningElement {
    @wire(getOldBears) bears;
}