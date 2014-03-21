// JavaScript Document

function UTNote(note){
	note = note || {};
	this.id = note.id;
	this.configs = note.configs;
	this.content = note.content;
}
function UTNoteConfig(configs){
	configs = configs || {};
	this.background = configs.background;
	this.createtime = configs.createtime;
	this.updatetime = configs.updatetime;
	this.title = configs.title;
	this.contacts = configs.contacts;
}
// UTContactList
function UTContactList(){
	this.list = new Array();
}
UTContactList.prototype.addContact = function(contact){
	this.list.push(contact);
};
UTContactList.prototype.removeContact = function(contact){
	contact = contact || {};
	if (contact.id === undefined){
		return false;
	}
	// find
	var index = -1;
	for (var i = 0; i < this.list.length; i++){
		if (this.list[i].id === contact.id){ //found
			index = i;
			break;
		}
	}
	//
	if (index != -1){
		this.list.splice(index, 1);
		return true;
	}
	return false;
};
UTContactList.prototype.updateContact = function(contact){
	contact = contact || {};
	if (contact.id === undefined){
		return false;
	}
	// find
	for (var i = 0; i < this.list.length; i++){
		if (this.list[i].id === contact.id){ //found
			this.list[i] = contact;
			return true;
		}
	}
	return false;
}
// /UTContactList

// UTContact
function UTContact(contact){
	contact = contact || {};
	this.displayName = contact.displayName;
	this.phone = contact.phone;
}
function UTNoteContent(content){
	this.content = content;
}

UTNote.prototype.clearNote = function(){
	this.id = null;
	this.configs = new UTNoteConfig();
	this.content = new UTNoteContent();
};