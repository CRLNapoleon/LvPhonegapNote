// JavaScript Document

function UTNote(note){
	note = note || {};
	this.id = note.id;
	this.configs = note.configs;
	this.content = note.content;
}

UTNote.prototype.loadFromData = function(data){
	if ("string" == typeof data){
		data = $.parseXML(data);
	}
	this.id = $(data).find("save").first().attr('id');
	this.configs = new UTNoteConfig();
	//
	this.configs.loadFromData($(data).find("save config").first());
	//
	this.content = new UTNoteContent();
	//
	this.content.loadFromData($(data).find("save content").first());
};

UTNote.prototype.clearNote = function(){
	this.id = null;
	this.configs = new UTNoteConfig();
	this.content = new UTNoteContent();
};
UTNote.prototype.toXMLString = function(){
	var s = $(this.toXML())[0].outerHTML;
	/*
	var t = -1;
	while ((t = s.indexOf("<img", t)) != -1){
		var t2 = s.indexOf(">", t);
		var st = s.substring(t, t2 + 1);
		s = s.replace(st, st.substring(0, st.length - 1) + "/>");
		t = t2;
	}*/
	return '<?xml version="1.0" encoding="UTF-8"?>' + s;
};
UTNote.prototype.toXML = function(){
	var root = $("<save></save>");
	root.attr('id', this.id);
	root
		.append(this.configs.toXML())
		.append(this.content.toXML());
	return root;
};

function UTNoteConfig(configs){
	configs = configs || {};
	this.background = configs.background;
	this.createtime = configs.createtime;
	this.updatetime = configs.updatetime;
	this.title = configs.title;
	this.contacts = configs.contacts;
}
UTNoteConfig.prototype.loadFromData = function(data){
	var note_background = $(data).find("background").first().text();
	var note_createtime = $(data).find("createtime").first().text();
	var note_updatetime = $(data).find("updatetime").first().text();
	var note_title = $(data).find("title").first().text();
	var note_contacts = new UTContactList();
	$(data).find("contacts > contact").each(function(index, element) {
		var cid = $(element).attr('id');
		var cdn = $(element).find("displayName").text();
		var cp = $(element).find("phone").text();
        var contact = new UTContact({ id : cid, displayName : cdn, phone : cp });
		note_contacts.addContact(contact);
    });
	//
	this.background = note_background;
	this.createtime = note_createtime;
	this.updatetime = note_updatetime;
	this.title = note_title;
	this.contacts = note_contacts;
};
UTNoteConfig.prototype.toXML = function(){
	var rootConfig = $("<config></config>");
	rootConfig
		.append("<background>"+this.background+"</background>")
		.append("<createtime>"+this.createtime+"</createtime>")
		.append("<updatetime>"+this.updatetime+"</updatetime>")
		.append("<title>"+this.title+"</title>")
		.append(this.contacts.toXML());
	return rootConfig;
};
// UTContactList
function UTContactList(){
	this.list = new Array();
}
UTContactList.prototype.toXML = function(){
	var rootContacts = $("<contacts></contacts>");
	$(this.list).each(function(index, element) {
        rootContacts.append(element.toXML());
    });
	return rootContacts;
};
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
	this.id = contact.id;
	this.displayName = contact.displayName;
	this.phone = contact.phone;
}
UTContact.prototype.toXML = function(){
	var rootContact = $("<contact></contact>");
	rootContact.attr('id', this.id);
	rootContact
		.append("<displayName>"+this.displayName+"</displayName>")
		.append("<phone>"+this.phone+"</phone>");
	return rootContact;
};
// UTNoteContent
function UTNoteContent(content){
	content = content || {};
	this.imgs = content.imgs;
	this.text = content.text;
}

UTNoteContent.prototype.loadFromData = function(data){
	var content_imgs = new UTContentImgList();
	// img tag
	$(data).find("imgs > photo").each(function(index, element) {
		content_imgs.addImg(new UTContentImage({ alt: $(element).attr('alt'), data: $(element).text() }));
    });
	// text
	var txt = $(data).find("text").first();
	this.imgs = content_imgs;
	this.text = txt;
};
UTNoteContent.prototype.toXML = function(){
	var rootContent = $("<content></content>");
	rootContent
		.append(this.text)
		.append(this.imgs.toXML());
	return rootContent;
};

// UTContent >
function UTContentImgList(imgs){
	imgs = imgs || [];
	this.list = imgs;
}
UTContentImgList.prototype.addImg = function(img){
	this.list.push(img);
};
UTContentImgList.prototype.removeImg = function(img){
	var index = this.list.indexOf(img);
	if (index != -1){
		this.list.splice(index, 1);
		return true;
	}
	return false;
};
UTContentImgList.prototype.toXML = function(){
	var rootImgList = $("<imgs></imgs>");
	$(this.list).each(function(index, element) {
        rootImgList.append(element.toXML());
    });
	return rootImgList;
};
// UTContentImage
function UTContentImage(imgData){
	imgData = imgData || {};
	this.alt = imgData.alt;
	this.data = imgData.data;
}
UTContentImage.prototype.toXML = function(){
	var rootImage = $("<photo>"+this.data.toString()+"</photo>");
	rootImage.attr('alt', this.alt);
	return rootImage;
};
//
// Load Data
//
var __noteLoading = null;
var __noteLoadDone = null;

function loadNote(noteId, loadDone){
	__noteLoading = noteId;
	__noteLoadDone = loadDone;
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, getnote_gotFS, getnote_fail);
}
function getnote_gotFS(fileSystem){
	fileSystem.root.getFile("note" + __noteLoading + ".mnf", null, notegotFileEntry, getnote_fail);
}
function notegotFileEntry(fileEntry){
	fileEntry.file(notegetfile, getnote_fail);
}
function notegetfile(file){
	//
	var reader = new FileReader();
	reader.onloadend = function(evt){
		var file_content = $.parseXML(evt.target.result);
		//
		__CurrentNote.id = $(file_content).find("save").first().attr('id');
		__CurrentNote.configs.loadFromData($(file_content).find("save config").first());
		__CurrentNote.content.loadFromData($(file_content).find("save content").first());
		// callback
		__noteLoadDone();
	};
	reader.readAsText(file);
	//
}
function getnote_fail(error){
}