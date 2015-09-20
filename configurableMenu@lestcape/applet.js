//Cinnamon Applet: Configurable Menu
//
//Authors: Lester Carballo Pérez(https://github.com/lestcape) and Garibaldo(https://github.com/Garibaldo).
//
//          Email: lestcape@gmail.com     Website: https://github.com/lestcape/Configurable-Menu
//
// "This is a fork of the Cinnamon stock menu, but with much more features
//  and extremely configurable."
//
// This program is free software:
//
//    You can redistribute it and/or modify it under the terms of the
//    GNU General Public License as published by the Free Software
//    Foundation, either version 3 of the License, or (at your option)
//    any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.
//

/*

const Signals = imports.signals;
const ICON_SIZE = 16;
*/
const Util = imports.misc.util;
const Tweener = imports.ui.tweener;
const Pango = imports.gi.Pango;
const DND = imports.ui.dnd;
const Meta = imports.gi.Meta;
const Clutter = imports.gi.Clutter;
//const Atk = imports.gi.Atk; //check if this is supported on old cinnamon versions, and then active it.
const Applet = imports.ui.applet;
const ScreenSaver = imports.misc.screenSaver;
const GnomeSession = imports.misc.gnomeSession;
const St = imports.gi.St;
const Gio = imports.gi.Gio;
const PopupMenu = imports.ui.popupMenu;
const Gtk = imports.gi.Gtk;
const Mainloop = imports.mainloop;
const Settings = imports.ui.settings;
const Main = imports.ui.main;
const Cinnamon = imports.gi.Cinnamon;
const DocInfo = imports.misc.docInfo;
const Lang = imports.lang;
const AppFavorites = imports.ui.appFavorites;
const GLib = imports.gi.GLib;
const AccountsService = imports.gi.AccountsService;
const FileUtils = imports.misc.fileUtils;
const AppletPath = imports.ui.appletManager.applets['configurableMenu@lestcape'];
const ConfigurableMenus = AppletPath.configurableMenus;
const PakagesManager = AppletPath.pakagesManager;
const MenuItems = AppletPath.menuItems;
const MenuBox = AppletPath.menuBox;
const ConfigurableScrolls = AppletPath.configurableScrolls;
const Gettext = imports.gettext;
var APIMenu;
try {
   APIMenu = imports.gi.CMenu;
} catch(e) {
   APIMenu = imports.gi.GMenu;
}
const CMenu = APIMenu;
let appsys = Cinnamon.AppSystem.get_default();

const USER_DESKTOP_PATH = FileUtils.getUserDesktopDir();

//const MAX_FAV_ICON_SIZE = 32;
//const HOVER_ICON_SIZE = 68;
//const APPLICATION_ICON_SIZE = 22;
//const CATEGORY_ICON_SIZE = 22
const MAX_RECENT_FILES = 20;
const CATEGORY_ARROW_SIZE = 12;
const INITIAL_BUTTON_LOAD = 30;
const POPUP_ANIMATION_TIME = 0.15;
;

function _(str) {
   let resultConf = Gettext.dgettext("configurableMenu@lestcape", str);
   if(resultConf != str) {
      return resultConf;
   }
   return Gettext.gettext(str);
};
/*
function SettingComboHandler(settings, comboName) {
   this._init(settings, comboName);
}

SettingComboHandler.prototype = {
   _init: function(settings, comboName) {
      this.settings = settings;
      this.comboName = comboName;
      this.pathToOriginalSettings = GLib.get_home_dir() + "/.local/share/cinnamon/applets/" + uuid + "/settings-schema.json";
      this.orgSettingsJson= JSON.parse(Cinnamon.get_file_contents_utf8_sync(this.pathToOriginalSettings));
      this.file_changed_timeout = 0;
   },

   _readDataFromCombo: function() {
   },

   _writeDataToCombo: function(json, data) {
      try {
         let fontItem, lengthItem, family;
         json["search-engine"]["options"] = data;
         let raw_file = JSON.stringify(new_json, null, 4);
         let file = Gio.file_new_for_path(patch);
         if(file.delete(null, null)) {
            let f = Gio.file_new_for_path(this.file.get_path());
            let raw = f.replace(null, false, Gio.FileCreateFlags.NONE, null);
            let out_file = Gio.BufferedOutputStream.new_sized (raw, 4096);
            Cinnamon.write_string_to_stream(out_file, JSON.stringify(this.json, null, 4));
            out_file.close(null);
            if(this.file_changed_timeout == 0)
               this.file_changed_timeout = Mainloop.timeout_add(300, Lang.bind(this, this._reloadData))
         } else {
            //global.logError("Failed gain write access to settings file for applet/desklet '" + this.uuid + "', instance ") + this.instanceId;
         }
      } catch(e) {
         this.showErrorMessage(e.message);
      }
   },

   _reloadData: function() {
      Mainloop.source_remove(this.file_changed_timeout);
      this.file_changed_timeout = 0;
      this.settings._maybe_update_settings_file();
   }
};
*/
function SpecialBookmarks(name, icon, path) {
   this._init(name, icon, path);
}

SpecialBookmarks.prototype = {

   _init: function(name, icon, path) {
      this.name = name;
      this._icon = icon;
      this._path = path;
      this.id = "bookmark:file://" + this._path;
   },

   launch: function() {
      Util.spawnCommandLine('xdg-open ' + this._path);
   },

   iconFactory: function(iconSize) {
      return new St.Icon({icon_name: this._icon, icon_size: iconSize, icon_type: St.IconType.FULLCOLOR});
   },

   get_icon_name: function() {
      return this._icon;
   }
};

function VisibleChildIterator(parent, container, numberView) {
   this._init(parent, container, numberView);
}

VisibleChildIterator.prototype = {
   _init: function(parent, container, numberView) {
      this.container = container;
      this._parent = parent;
      this._numberView = numberView;
      this._num_children = 0;
      this.reloadVisible();
   },

   reloadVisible: function() {
      try {
         this.visible_children = new Array();
         this.abs_index = new Array();
         this.cat_index = new Array();
         this.inter_index = new Array();
         let child, children, internalBox, interIndex;
         let childrenCat = this.container.get_children();
         for(let k = 0; k < childrenCat.length; k++) {
            children = childrenCat[k].get_children();
            for(let j = 0; j < children.length; j++) {
               internalBox = children[j].get_children();
               interIndex = 0;
               for(let i = 0; i < internalBox.length; i++) {
                  child = internalBox[i];
                  if(child.visible) {
                     this.visible_children.push(child);
                     this.abs_index.push(j);
                     this.cat_index.push(k);
                     this.inter_index.push(interIndex);
                     interIndex++;
                  }
               }
            }
         }
         this._num_cat = childrenCat.length;
         this._num_children = this.visible_children.length;
      } catch(e) {
         Main.notify(e.message);
      }
   },

   setNumberView: function(numberView) {
      this._numberView = numberView;
   },

   getAppAt: function(k, x, y) {
      return this.container.get_child_at_index(k).get_child_at_index(x).get_child_at_index(y);
      /*for(let k = 0; k < childrenCat.length; k++) {
          
      }*/
   },

   isInBorder: function(catIndex, index, rowIndex, scapeKey) {
      if(scapeKey == Clutter.KEY_Left)
         return (index == 0);
      if(scapeKey == Clutter.KEY_Right)
         return (this.container.get_child_at_index(catIndex).get_children().length - 1 == index);
      if(scapeKey == Clutter.KEY_Up)
         return (rowIndex == 0);
      if(scapeKey == Clutter.KEY_Down)
         return ((this.container.get_child_at_index(catIndex).get_child_at_index(index).get_children().length)/2 == rowIndex + 1);
      return false;
   },

   getNextVisible: function(cur_child) {
      let pos = this.visible_children.indexOf(cur_child);
      if(pos == this._num_children-1)
         return this.visible_children[0];
      else
         return this.visible_children[this.visible_children.indexOf(cur_child)+1];
   },

   getPrevVisible: function(cur_child) {
      if(this.visible_children.indexOf(cur_child) == 0)
         return this.visible_children[this._num_children-1];
      else
         return this.visible_children[this.visible_children.indexOf(cur_child)-1];
   },

   getLeftVisible: function(cur_child) {
      let rowIndex = cur_child.get_parent().get_children().indexOf(cur_child);
      let colIndex = cur_child.get_parent().get_parent().get_children().indexOf(cur_child.get_parent());
      if(colIndex == 0) {
         let pos = this._numberView - 1;
         let left_item = cur_child.get_parent().get_parent().get_child_at_index(pos).get_child_at_index(rowIndex);
         while(!left_item) {
            pos--;
            left_item = cur_child.get_parent().get_parent().get_child_at_index(pos).get_child_at_index(rowIndex);
         }
         return left_item;
      }
      else
         return cur_child.get_parent().get_parent().get_child_at_index(colIndex - 1).get_child_at_index(rowIndex);
   },

   getRightVisible: function(cur_child) {
      let rowIndex = cur_child.get_parent().get_children().indexOf(cur_child);
      let colIndex = cur_child.get_parent().get_parent().get_children().indexOf(cur_child.get_parent());
      let right_item = null;
      let childr;
      if(colIndex == this._numberView - 1)
         right_item = cur_child.get_parent().get_parent().get_child_at_index(0).get_child_at_index(rowIndex);
      else {
         childr = cur_child.get_parent().get_parent().get_child_at_index(colIndex + 1);
         if(childr)
             right_item = childr.get_child_at_index(rowIndex);
         if(!right_item)
            right_item = right_item = cur_child.get_parent().get_parent().get_child_at_index(0).get_child_at_index(rowIndex);
      }
      return right_item;
   },

   getFirstVisible: function() {
      if(this.visible_children.length > 0)
         return this.visible_children[0];
      return null;
   },

   getLastVisible: function() {
      return this.visible_children[this._num_children-1];
   },

   getVisibleIndex: function(cur_child) {
      return this.visible_children.indexOf(cur_child);
   },

   getVisibleItem: function(index) {
      return this.visible_children[index];
   },

   getNumVisibleChildren: function() {
      return this._num_children;
   },

   getInternalIndexOfChild: function(child) {
      //return child.get_parent().get_parent().get_children().indexOf(child.get_parent());
      if(this.inter_index)
         return this.inter_index[this.visible_children.indexOf(child)];
      return 0;
   },

   getCategoryIndexOfChild: function(child) {
      //return child.get_parent().get_parent().get_children().indexOf(child.get_parent());
      if(this.inter_index)
         return this.cat_index[this.visible_children.indexOf(child)];
      return 0;
   },

   getAbsoluteIndexOfChild: function(child) {
      return this.abs_index[this.visible_children.indexOf(child)];
   }
};

function ConfigurableMenu(launcher, orientation, subMenu) {
   this._init(launcher, orientation, subMenu);
}

ConfigurableMenu.prototype = {
   //__proto__: PopupMenu.PopupMenuBase.prototype,
     __proto__: Applet.AppletPopupMenu.prototype,

   _init: function(launcher, orientation, subMenu) {
      PopupMenu.PopupMenuBase.prototype._init.call (this, launcher.actor, 'popup-menu-content');
      try {
         this._arrowAlignment = 0.0;
         this._arrowSide = orientation;
         this.subMenu = subMenu;
         this.effectType = "none";
         this.effectTime = 0.4;

         this._boxPointer = new ConfigurableMenus.ConfigurablePointer(orientation,
                                                    { x_fill: true,
                                                      y_fill: true,
                                                      x_align: St.Align.START });
         this.actor = this._boxPointer.actor;
         Main.uiGroup.add_actor(this.actor);

         this.actor._delegate = this;
         this.actor.style_class = 'popup-menu-boxpointer';
         this.actor.connect('key-press-event', Lang.bind(this, this._onKeyPressEvent));

         this._boxWrapper = new Cinnamon.GenericContainer();
         this._boxWrapper.connect('get-preferred-width', Lang.bind(this, this._boxGetPreferredWidth));
         this._boxWrapper.connect('get-preferred-height', Lang.bind(this, this._boxGetPreferredHeight));
         this._boxWrapper.connect('allocate', Lang.bind(this, this._boxAllocate));
         this._boxPointer.bin.set_child(this._boxWrapper);
         this._boxWrapper.add_actor(this.box);
         this.actor.add_style_class_name('popup-menu');

         global.focus_manager.add_group(this.actor);
         this.actor.reactive = true;
         this.actor.hide();
      } catch(e) {
         Main.notify("ErrorMenuCreation", e.message);
      }
   },

   on_paint: function(actor) {
      if(Main.popup_rendering)
         Main.popup_rendering = false;
      if(Main.popup_rendering_actor)
         Main.popup_rendering_actor = null;
   },

   setEffect: function(effect) {
      this.effectType = effect;
   },

   setEffectTime: function(effectTime) {
      this.effectTime = effectTime;
   },

   setArrowSide: function(side) {
      this._arrowSide = side;
      this._boxPointer.setArrowSide(side);
   },

   _boxGetPreferredWidth: function (actor, forHeight, alloc) {
      let columnWidths = this.getColumnWidths();
      this.setColumnWidths(columnWidths);
      // Now they will request the right sizes
      [alloc.min_size, alloc.natural_size] = this.box.get_preferred_width(forHeight);
   },

   _boxGetPreferredHeight: function (actor, forWidth, alloc) {
      [alloc.min_size, alloc.natural_size] = this.box.get_preferred_height(forWidth);
   },

   _boxAllocate: function (actor, box, flags) {
      this.box.allocate(box, flags);
   },

   _onKeyPressEvent: function(actor, event) {
      if(event.get_key_symbol() == Clutter.Escape) {
         this.close(true);
         return true;
      }
      return false;
   },

   setArrowOrigin: function(origin) {
      this._boxPointer.setArrowOrigin(origin);
   },

   setSourceAlignment: function(alignment) {
      this._boxPointer.setSourceAlignment(alignment);
   },

   // Setting the max-height won't do any good if the minimum height of the
   // menu is higher then the screen; it's useful if part of the menu is
   // scrollable so the minimum height is smaller than the natural height
   setMaxHeight: function() {
      if(Main.panelManager) {
         let [x, y] = this.sourceActor.get_transformed_position();

         let i = 0;
         let monitor;
         for (; i < global.screen.get_n_monitors(); i++) {
            monitor = global.screen.get_monitor_geometry(i);
            if(x >= monitor.x && x < monitor.x + monitor.width &&
               x >= monitor.y && y < monitor.y + monitor.height) {
               break;
            }
         }

         let maxHeight = monitor.height - this.actor.get_theme_node().get_length('-boxpointer-gap');

         let panels = Main.panelManager.getPanelsInMonitor(i);
         for(let j in panels) {
            maxHeight -= panels[j].actor.height;
         }

         this.actor.style = ('max-height: ' + maxHeight / global.ui_scale + 'px;');
      } else {
         let monitor = Main.layoutManager.primaryMonitor;
         let maxHeight = Math.round(monitor.height - Main.panel.actor.height - this.actor.get_theme_node().get_length('-boxpointer-gap'));
         if (Main.panel2!=null) maxHeight -= Main.panel2.actor.height;
            this.actor.style = ('max-height: ' + maxHeight + 'px;');
      }
   },

//*************************************************
   _onKeyFocusOut: function (actor) {
      if(this._popupMenu.isOpen)
          return true;
        this.setActive(false);
      return false;
    },

   showBoxPointer: function(arrow) {
      this._boxPointer.showArrow(arrow);
   },

   fixToCorner: function(fixCorner) {
      this._boxPointer.fixToCorner(this.sourceActor, fixCorner);
   },

   fixToScreen: function(fixCorner) {
      this._boxPointer.fixToScreen(this.sourceActor, fixCorner);
   },

   setResizeArea: function(resizeSize) {
      this._boxPointer.setResizeArea(resizeSize);
   },

   setResizeAreaColor: function(resizeColor) {
      this._boxPointer.setResizeAreaColor(resizeColor);
   },

   repositionActor: function(actor) {
      if((this.sourceActor)&&(this.sourceActor != actor)) {
         if(this.isOpen)
            this._boxPointer.trySetPosition(actor, this._arrowAlignment);
      }
   },

   setSubMenu: function(subMenu) {
      this.subMenu = subMenu;
   },

   getCurrentMenuThemeNode: function() {
      return this._boxPointer.getCurrentMenuThemeNode();
   },

   shiftPosition: function(x, y) {
      this._boxPointer.shiftPosition(x, y);
   },

   openClean: function(animate) {
      Applet.AppletPopupMenu.prototype.open.call(this, animate);
   },

   closeClean: function(animate) {
      Applet.AppletPopupMenu.prototype.close.call(this, animate);
   },

   open: function(animate) {
      //if(this.subMenu)
      //   this.subMenu.close();
      if(!this.isOpen) {
         this.openClean();
         this.repositionActor(this.sourceActor);
         this._applyEffectOnOpen();
      }
   },

   close: function(animate) {
      //if(this.subMenu)
      //   this.subMenu.close();
      if(this.isOpen) {
         this._applyEffectOnClose();
      }
   },

   _applyEffectOnOpen: function(animate) {
      switch(this.effectType) {
         case "none"  :
            this._effectNoneOpen();
            break;
         case "dispel":
            this._effectDispelOpen();
            break;
         case "hideHorizontal"  :
            this._effectHideHorizontalOpen();
            break;
         case "hideVertical"  :
            this._effectHideVerticalOpen();
            break;
         case "scale" :
            this._effectScaleOpen();
            break;
         case "windows":
            this._effectWindowsOpen();
            break;
      }
   },

   _applyEffectOnClose: function(animate) {
      switch(this.effectType) {
         case "none"  :
            this._effectNoneClose(animate);
            break;
         case "dispel":
            this._effectDispelClose();
            break;
         case "hideHorizontal":
            this._effectHideHorizontalClose();
            break;
         case "hideVertical":
            this._effectHideVerticalClose();
            break;
         case "scale" :
            this._effectScaleClose();
            break;
         case "windows":
            this._effectWindowsClose();
            break;
      }
   },

   _effectNoneOpen: function() {
   },

   _effectNoneClose: function(animate) {
      this.closeClean(animate);
   },

   _effectDispelOpen: function() {
      Tweener.addTween(this.actor,
      {  opacity: 0,
         time: 0,
         transition: 'easeInSine',
         onComplete: Lang.bind(this, function() {
            Tweener.addTween(this.actor,
            {  opacity: 255,
               time: this.effectTime,
               transition: 'easeInSine'
            })
         })
      });
   },

   _effectDispelClose: function() {
      Tweener.addTween(this.actor,
      {  opacity: 0,
         time: this.effectTime,
         transition: 'easeInSine',
         onComplete: Lang.bind(this, function() {
            Applet.AppletPopupMenu.prototype.close.call(this, false);
         })
      });
   },
/*
   _effectGetOutOpen: function() {
      let [startX, ay] = this.sourceActor.get_transformed_position();
      let monitor = Main.layoutManager.primaryMonitor;
      if(startX > monitor.x + monitor.width/2)
          startX = monitor.x + monitor.width + 3*this.actor.width/2;
      else
          startX = 0;
      Tweener.addTween(this.actor,
      {
         x: startX,
         time: 0,
        // rotation_angle_x: -90,
         rotation_angle_y: 180,
         //rotation_angle_z: 90,
         transition: 'easeOutQuad',
         onComplete: Lang.bind(this, function() {
            Tweener.addTween(this.actor,
            {
                x: 0,
                //rotation_angle_x: 0,
                rotation_angle_y: 0,
                //rotation_angle_z: 0,
                time: this.effectTime
            })
         })
      });
   },

   _effectGetOutClose: function() {
      let [startX, ay] = this.sourceActor.get_transformed_position();
      let monitor = Main.layoutManager.primaryMonitor;
      if(startX > monitor.x + monitor.width/2)
          startX = monitor.x + monitor.width + 3*this.actor.width/2;
      else
          startX = 0;
      Tweener.addTween(this.actor,
      {
         x: startX,
         rotation_angle_y: 180,
         time: this.effectTime,
         transition: 'easeOutQuad',
         onComplete: Lang.bind(this, function() {
            
            Applet.AppletPopupMenu.prototype.close.call(this, false);
            Tweener.addTween(this.actor,
            {
                x: 0,
                rotation_angle_y: 0,
                time: 0
            })
         })
      });
   },*/

   _effectWindowsOpen: function() {
     let [startX, ay] = this.sourceActor.get_transformed_position();
      let monitor = Main.layoutManager.primaryMonitor;
      if(startX > monitor.x + monitor.width/2)
          startX = monitor.x + monitor.width + 3*this.actor.width/2;
      else
          startX = 0;
      Tweener.addTween(this.actor,
      {
         x: startX,
         time: 0,
         rotation_angle_y: 180,
         transition: 'easeOutQuad',
         onComplete: Lang.bind(this, function() {
            Tweener.addTween(this.actor,
            {
                x: 0,
                rotation_angle_y: 0,
                time: this.effectTime
            })
         })
      });
   },

   _effectWindowsClose: function() {
      let [startX, ay] = this.sourceActor.get_transformed_position();
      let monitor = Main.layoutManager.primaryMonitor;
      if(startX > monitor.x + monitor.width/2)
          startX = monitor.x + monitor.width + 3*this.actor.width/2;
      else
          startX = 0;
      Tweener.addTween(this.actor,
      {
         x: startX,
         rotation_angle_y: 180,
         time: this.effectTime,
         transition: 'easeOutQuad',
         onComplete: Lang.bind(this, function() {
            Applet.AppletPopupMenu.prototype.close.call(this, false);
            Tweener.addTween(this.actor,
            {
                x: 0,
                rotation_angle_y: 0,
                time: 0
            })
         })
      });
   },

  _effectHideHorizontalOpen: function() {
      let [startX, ay] = this.sourceActor.get_transformed_position();
      let monitor = Main.layoutManager.primaryMonitor;
      if(startX > monitor.x + monitor.width/2)
         startX += this.sourceActor.width;
      Tweener.addTween(this.actor,
      {
         x: startX,
         scale_x: 0,
         opacity: 255,
         time: 0,
         transition: 'easeOutQuad',
         onComplete: Lang.bind(this, function() {
            Tweener.addTween(this.actor,
            {
                x: 0,
                scale_x: 1,
                opacity: 255,
                time: this.effectTime
            })
         })
      });
   },

   _effectHideHorizontalClose: function() {
      let [startX, ay] = this.sourceActor.get_transformed_position();
      let monitor = Main.layoutManager.primaryMonitor;
      if(startX > monitor.x + monitor.width/2)
         startX += this.sourceActor.width;
      Tweener.addTween(this.actor,
      {
         x: startX,
         scale_x: 0,
         opacity: 255,
         time: this.effectTime,
         transition: 'easeOutQuad',
         onComplete: Lang.bind(this, function() {
            Applet.AppletPopupMenu.prototype.close.call(this, false);
            Tweener.addTween(this.actor,
            {
                x: 0,
                scale_x: 1,
                opacity: 255,
                time: 0
            })
         })
      });
   },

   _effectHideVerticalOpen: function() {
      let startY = this.sourceActor.height;
      if(this._arrowSide == St.Side.BOTTOM) {
         let monitor = Main.layoutManager.primaryMonitor;
         startY =  monitor.height - startY;
      }
      Tweener.addTween(this.actor,
      {
         y: startY,
         scale_y: 0,
         opacity: 255,
         time: 0,
         transition: 'easeOutQuad',
         onComplete: Lang.bind(this, function() {
            Tweener.addTween(this.actor,
            {
                y: 0,
                scale_y: 1,
                opacity: 255,
                time: this.effectTime
            })
         })
      });
   },

   _effectHideVerticalClose: function() {
      let startY = this.sourceActor.height;
      if(this._arrowSide == St.Side.BOTTOM) {
         let monitor = Main.layoutManager.primaryMonitor;
         startY =  monitor.height - startY;
      }
      Tweener.addTween(this.actor,
      {
         y: startY,
         scale_y: 0,
         opacity: 255,
         time: this.effectTime,
         transition: 'easeOutQuad',
         onComplete: Lang.bind(this, function() {
            Applet.AppletPopupMenu.prototype.close.call(this, false);
            Tweener.addTween(this.actor,
            {
                y: 0,
                scale_y: 1,
                opacity: 255,
                time: 0
            })
         })
      });
   },

   _effectScaleOpen: function() {
      let monitor = Main.layoutManager.primaryMonitor;
      let [startX, ay] = this.sourceActor.get_transformed_position();
      let startY = this.sourceActor.height;
      if(startX > monitor.x + monitor.width/2)
         startX += this.sourceActor.width;
      if(this._arrowSide == St.Side.BOTTOM)
         startY =  monitor.height - startY;
      Tweener.addTween(this.actor,
      {
         x: startX, y: startY,
         scale_x: 0, scale_y: 0,
         opacity: 255,
         time: 0,
         transition: 'easeOutQuad',
         onComplete: Lang.bind(this, function() {
            Tweener.addTween(this.actor,
            {
                x: 0, y: 0,
                scale_x: 1, scale_y: 1,
                opacity: 255,
                time: this.effectTime
            })
         })
      });
   },

   _effectScaleClose: function() {
      let monitor = Main.layoutManager.primaryMonitor;
      let [startX, ay] = this.sourceActor.get_transformed_position();
      let startY = this.sourceActor.height;
      if(startX > monitor.x + monitor.width/2)
         startX += this.sourceActor.width;
      if(this._arrowSide == St.Side.BOTTOM)
         startY =  monitor.height - startY;
      Tweener.addTween(this.actor,
      {
         x: startX, y: startY,
         scale_x: 0, scale_y: 0,
         opacity: 255,
         time: this.effectTime,
         transition: 'easeOutQuad',
         onComplete: Lang.bind(this, function() {
            Applet.AppletPopupMenu.prototype.close.call(this, false);
            Tweener.addTween(this.actor,
            {
                x: 0, y: 0,
                scale_x: 1, scale_y: 1,
                opacity: 255,
                time: 0
            })
         })
      });
   },

   destroy: function() {
      if(this._popupMenu) {
         this._popupMenu.close();
         this._menuManager.removeMenu(this._popupMenuu);
         this._popupMenu.destroy();
         this._popupMenu = null;
      }
      Applet.AppletPopupMenu.prototype.destroy.call(this);
   }
};

function ConfigurablePopupMenu(parent, parentMenu, orientation) {
   this._init(parent, parentMenu, orientation);
};

ConfigurablePopupMenu.prototype = {
   __proto__: ConfigurableMenu.prototype,

   _init: function(parent, parentMenu, orientation) {
      ConfigurableMenu.prototype._init.call(this, parentMenu, orientation);
      this.parent = parent;
      this.parentMenu = parentMenu;
      this.fixScreen = false;
      if(this.parentMenu instanceof ConfigurableMenu)
         this.parentMenu.setSubMenu(this);
      this.actor.add_style_class_name('menu-context-menu');
   },

   reparentMenu: function(parentMenu, orientation) {
      //if(!this.fixScreen) {
         if((parentMenu)&&(parentMenu != this.parentMenu)) {
            this.setArrowSide(orientation);
            this.parentMenu = parentMenu;
            this.sourceActor = this.parentMenu.actor;
         }
     // }
   },

   fixToScreen: function(fixScreen) {
      try {
         if(fixScreen) {
            this._boxPointer.fixToScreen(this.parent.menu.actor, fixScreen);
         } else {
            this._boxPointer.fixToScreen(this.parentMenu.actor, fixScreen);
         }
         this.fixScreen = fixScreen;
      } catch(e) {
         Main.notify("eee", e.message);
      }
   },

   fixToCorner: function(fixCorner) {
     /* try {
         Main.notify("hola");
         if(fixScreen) {
            this._parentMenu = this.parentMenu;
            this.reparentMenu(this.parent.menu, this._boxPointer._arrowSide);
            if(this._boxPointer._arrowSide == St.Side.LEFT)
               Main.notify("left");
            this._boxPointer.fixToScreen(this.sourceActor, fixScreen);
         } else {
            this.parentMenu = this._parentMenu;
            this.reparentMenu(this.parentMenu, this._boxPointer._arrowSide);
            this._boxPointer.fixToScreen(this.sourceActor, fixScreen);
         }
      } catch(e) {
         Main.notify("eee", e.message);
      }*/
   },

   repositionActor: function(actor) {
      if((this.sourceActor)&&(this.sourceActor != actor)) {
         if(this.isOpen)
            this._boxPointer.trySetPosition(actor, this._arrowAlignment);
      }
   },

   open: function(animate) {
      if((this.parentMenu != this.parent)&&(!this.parentMenu.isOpen))
         return;
      //(Dalcde idea)Temporarily change source actor to Main.uiGroup to "trick"
      // the menu manager to think that right click submenus are part of it.
      this.parentMenu.sourceActor = Main.uiGroup;
      Applet.AppletPopupMenu.prototype.open.call(this, animate);
   },

   close: function(animate) {
      this.parentMenu.sourceActor = this.parent.actor;
      Applet.AppletPopupMenu.prototype.close.call(this, animate);
      if((this.parentMenu.isOpen)&&(this.parent.searchEntry))
         this.parent.searchEntry.grab_key_focus();
   }
};

function MyApplet(metadata, orientation, panel_height, instance_id) {
   this._init(metadata, orientation, panel_height, instance_id);
}

MyApplet.prototype = {
   __proto__: Applet.TextIconApplet.prototype,

   _init: function(metadata, orientation, panel_height, instance_id) {
      Applet.TextIconApplet.prototype._init.call(this, orientation, panel_height, instance_id);
      try {
         this.deltaMinResize = 20;
         this.aviableWidth = 0;
         this.metadata = metadata;
         this.uuid = metadata["uuid"];
         this.allowFavName = false;
         this.iconAppSize = 22;
         this.iconCatSize = 22;
         this.iconMaxFavSize = 20;
         this.iconPowerSize = 20;
         this.iconHoverSize = 68;
         this.iconAccessibleSize = 68;
         this.iconView = false;
         this.iconViewCount = 1;
         this.favoritesLinesNumber = 1;
         this.orientation = orientation;
         this._searchIconClickedId = 0;
         this._applicationsButtons = new Array();
         this._applicationsButtonFromApp = new Object();
         this._favoritesButtons = new Array();
         this._placesButtons = new Array();
         this._transientButtons = new Array();
         this._recentButtons = new Array();
         this._categoryButtons = new Array();
         this._selectedItemIndex = null;
         this._previousContextMenuOpen = null;
         this._previousTreeItemIndex = null;
         this._previousSelectedActor = null;
         this._previousVisibleIndex = null;
         this._previousTreeSelectedActor = null;
         this._activeContainer = null;
         this._activeActor = null;
         this._applicationsBoxWidth = 0;
         this.menuIsOpening = false;
         this._knownApps = new Array(); // Used to keep track of apps that are already installed, so we can highlight newly installed ones
         this._appsWereRefreshed = false;
         this.showTimeDate = false;
         this.timeFormat = "%H:%M";
         this.dateFormat = "%A,%e %B";
         this.appTitleSize = 10;
         this.appDescriptionSize = 8;
         this.showAppTitle = true;
         this.showAppDescription = true;
         this.controlingSize = false;
         this.minimalWidth = -1;
         this.minimalHeight = -1;
         this._timeOutSettings = 0;
         this.idWaitingGnome = 0;
         this.idAppletEnter = 0;
         this.idAppletLeave = 0;
         this._searchItems = [];
         this.pkg = new PakagesManager.PackageInstallerWrapper(this);

         this.execInstallLanguage();
         //_ = Gettext.domain(this.uuid).gettext;
         Gettext.bindtextdomain(this.uuid, GLib.get_home_dir() + "/.local/share/locale");
         let iconPath = GLib.get_home_dir() + "/.local/share/cinnamon/applets/" + this.uuid + "/icons";
         Gtk.IconTheme.get_default().append_search_path(iconPath);

         this.set_applet_tooltip(_("Menu"));
         this.RecentManager = new DocInfo.DocManager();
         if(this.orientation == St.Side.TOP)
            this.actor.add_style_class_name('menu-applet-panel-top-box');
         else
            this.actor.add_style_class_name('menu-applet-panel-bottom-box'); 

         this.menuManager = new PopupMenu.PopupMenuManager(this);
         this._updateMenuSection();

         this.actor.connect('key-press-event', Lang.bind(this, this._onSourceKeyPress));
         this.actor.connect('button-release-event', Lang.bind(this, this._onButtonReleaseEvent));
         this.actor.connect('button-press-event', Lang.bind(this, this._onButtonPressEvent));
         //this._keyFocusNotifyIDSignal = global.stage.connect('notify::key-focus', Lang.bind(this, this._onKeyFocusChanged));

         this.settings = new Settings.AppletSettings(this, this.uuid, instance_id);

         this.settings.bindProperty(Settings.BindingDirection.IN, "theme", "theme", this._onSelectedThemeChange, null);

         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "show-recent", "showRecent", this._refreshPlacesAndRecent, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "show-places", "showPlaces", this._refreshPlacesAndRecent, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "activate-on-hover", "activateOnHover",this._updateActivateOnHover, null);
         //this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "menu-icon-custom", "menuIconCustom", this._updateIconAndLabel, null);
                        
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "menu-icon", "menuIcon", this._updateIconAndLabel, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "menu-label", "menuLabel", this._updateIconAndLabel, null);
         this.settings.bindProperty(Settings.BindingDirection.IN, "overlay-key", "overlayKey", this._updateKeybinding, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "allow-search", "showSearhEntry", this._setSearhEntryVisible, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "effect", "effect", this._onEffectChange, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "effect-time", "effectTime", this._onEffectTimeChange, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "swap-panels", "swapPanels", this._onSwapPanel, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "categories-hover", "categoriesHover", this._onCategoriesOpenChange, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "hover-delay", "hover_delay_ms", this._update_hover_delay, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "enable-autoscroll", "autoscroll_enabled", this._update_autoscroll, null);

         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "power-theme", "powerTheme", this._onThemePowerChange, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "gnomenu-buttons-theme", "gnoMenuButtonsTheme", this._onThemeGnoMenuButtonsChange, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "show-view-item", "showView", this._setVisibleViewControl, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "control-symbolic", "controlSymbolic", this._setControlButtonsSymbolic, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "power-symbolic", "powerSymbolic", this._setPowerButtonsSymbolic, null);

         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "view-item", "iconView", this._changeView, null);

         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "activate-on-press", "activateOnPress", null, null);

         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "hover-box", "showHoverIconBox", this._setVisibleHoverIconBox, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "control-box", "showControlBox", this._setVisibleControlBox, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "power-box", "showPowerBox", this._setVisiblePowerBox, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "accessible-box", "showAccessibleBox", this._setVisibleAccessibleBox, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "gnomenu-box", "showGnoMenuBox", this._setVisibleGnoMenuBox, null);

         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "show-removable-drives", "showRemovable", this._setVisibleRemovable, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "accessible-icons", "showAccessibleIcons", this._setVisibleAccessibleIcons, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "categories-icons", "showCategoriesIcons", this._setVisibleCategoriesIcons, null);

         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "app-button-width", "textButtonWidth", this._changeView, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "app-description", "appButtonDescription", this._changeView, null);

         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "icon-app-size", "iconAppSize", this._onAppsChange, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "icon-cat-size", "iconCatSize", this._onAppsChange, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "icon-max-fav-size", "iconMaxFavSize", this._setIconMaxFavSize, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "icon-power-size", "iconPowerSize", this._setIconPowerSize, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "icon-control-size", "iconControlSize", this._setIconControlSize, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "icon-hover-size", "iconHoverSize", this._setIconHoverSize, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "icon-accessible-size", "iconAccessibleSize", this._setIconAccessibleSize, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "icon-gnomenu-size", "iconGnoMenuSize", this._setIconGnoMenuSize, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "show-favorites", "showFavorites", this._setVisibleFavorites, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "favorites-lines", "favoritesLinesNumber", this._setVisibleFavorites, null);

         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "show-hover-icon", "showHoverIcon", this._setVisibleHoverIcon, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "show-power-buttons", "showPowerButtons", this._setVisiblePowerButtons, null);
         
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "show-time-date", "showTimeDate", this._setVisibleTimeDate, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "time-format", "timeFormat", this._updateTimeDateFormat, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "date-format", "dateFormat", this._updateTimeDateFormat, null);

         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "show-app-title", "showAppTitle", this._updateAppSelectedText, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "app-title-size", "appTitleSize", this._updateAppSelectedText, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "show-app-description", "showAppDescription", this._updateAppSelectedText, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "app-description-size", "appDescriptionSize", this._updateAppSelectedText, null);

         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "allow-resizing", "controlingSize", this._activeResize, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "automatic-size", "automaticSize", this._setAutomaticSize, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "full-screen", "fullScreen", this._setFullScreen, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "width", "width", this._updateSize, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "height", "height", this._updateSize, null);

         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "scroll-favorites", "scrollFavoritesVisible", this._setVisibleScrollFav, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "scroll-categories", "scrollCategoriesVisible", this._setVisibleScrollCat, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "arrow-categories", "arrowCategoriesVisible", this._setVisibleArrowCat, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "arrow-categories-selected", "arrowCategoriesSelected", this._setVisibleArrowCat, null);

         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "scroll-applications", "scrollApplicationsVisible", this._setVisibleScrollApp, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "scroll-accessible", "scrollAccessibleVisible", this._setVisibleScrollAccess, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "scroll-gnomenu", "scrollGnoMenuVisible", this._setVisibleScrollGnoMenu, null);

         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "spacer-line", "showSeparatorLine", this._setVisibleSeparatorLine, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "spacer-size", "separatorSize", this._updateSeparatorSize, null);

         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "show-box-pointer", "showBoxPointer", this._setVisibleBoxPointer, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "fix-menu-corner", "fixMenuCorner", this._setFixMenuCorner, null);
//Config//
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "list-places", "stringPlaces", null, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "list-places-names", "stringPlacesNames", null, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "list-apps", "stringApps", null, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "list-apps-names", "stringAppsNames", null, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "list-apps-usage", "stringAppsUsage", null, null);

         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "submenu-width", "subMenuWidth", this._updateSubMenuSize, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "submenu-height", "subMenuHeight", this._updateSubMenuSize, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "submenu-align", "subMenuAlign", this._alignSubMenu, null);

         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "search-sorted", "searchSorted", null, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "search-filesystem", "searchFilesystem", null, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "search-web", "searchWeb", this._onSearchEnginesChanged, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "search-wikipedia", "searchWikipedia", this._onSearchEnginesChanged, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "search-google", "searchGoogle", this._onSearchEnginesChanged, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "search-duckduckgo", "searchDuckduckgo", this._onSearchEnginesChanged, null);

         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "installer-tools", "enableInstaller", this._packageInstallerChanged, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "installer-search", "enablePackageSearch", this._packageSearchChanged, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "installer-max-search", "installerMaxSearch", this._packageMaxSearchChanged, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "installer-update-check", "enableCheckUpdate", this._packageInstallerCheck, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "installer-default", "enableDefaultInstaller", this._packageInstallerDefault, null);

         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "classic", "stringClassic", null, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "classicGnome", "stringClassicGnome", null, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "whisker", "stringWhisker", null, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "kicker", "stringKicker", null, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "gnomenuLeft", "stringGnoMenuLeft", null, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "gnomenuRight", "stringGnoMenuRight", null, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "gnomenuTop", "stringGnoMenuTop", null, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "gnomenuBottom", "stringGnoMenuBottom", null, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "vampire", "stringVampire", null, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "garibaldo", "stringGaribaldo", null, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "stylized", "stringStylized", null, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "dragon", "stringDragon", null, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "dragonInverted", "stringDragonInverted", null, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "luzHelena", "stringLuzHelena", null, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "accessible", "stringAccessible", null, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "accessibleInverted", "stringAccessibleInverted", null, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "mint", "stringMint", null, null);
         this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, "windows7", "stringWindows7", null, null);
//Config//

         this._searchInactiveIcon = new St.Icon({ style_class: 'menu-search-entry-icon',
                                                  icon_name: 'edit-find',
                                                  icon_type: St.IconType.SYMBOLIC });
         this._searchActiveIcon = new St.Icon({ style_class: 'menu-search-entry-icon',
                                                icon_name: 'edit-clear',
                                                icon_type: St.IconType.SYMBOLIC });

         appsys.connect('installed-changed', Lang.bind(this, this._onAppsChange));
         //AppFavorites.getAppFavorites().connect('changed', Lang.bind(this, this._refreshFavs));
         AppFavorites.getAppFavorites().connect('changed', Lang.bind(this, this._updateAppFavs));

         this._updateKeybinding();

         Main.placesManager.connect('places-updated', Lang.bind(this, this._refreshPlacesAndRecent));
         Main.themeManager.connect('theme-set', Lang.bind(this, this._onChangeCinnamonTheme));//this._updateIconAndLabel));cinnamon 2.2

         //St.TextureCache.get_default().connect("icon-theme-changed", Lang.bind(this, this._onThemeChange));
         St.TextureCache.get_default().connect("icon-theme-changed", Lang.bind(this, this._updateSize));//this.onIconThemeChanged));cinnamon 2.2

         this.RecentManager.connect('changed', Lang.bind(this, this._refreshPlacesAndRecent));

         //change this on settings //global.settings.connect("changed::menu-search-engines", Lang.bind(this, this._onSearchEnginesChanged));
         this.a11y_settings = new Gio.Settings({ schema: "org.cinnamon.desktop.a11y.applications" });
         this.a11y_settings.connect("changed::screen-magnifier-enabled", Lang.bind(this, this._updateVFade));

         this._fileFolderAccessActive = false;
         this._pathCompleter = new Gio.FilenameCompleter();
         this._pathCompleter.set_dirs_only(false);
         this.lastAcResults = new Array();

         this._updateConfig();
         this._packageInstallerCheck();
         this._packageInstallerDefault();
         this._packageMaxSearchChanged();
         this._updateComplete();
      }
      catch (e) {
         Main.notify("ErrorMain:", e.message);
         global.logError(e);
      }
   },

   destroy: function() {
      this.actor._delegate = null;
      this.menu.destroy();
      this.actor.destroy();
      this.emit('destroy');
   },

   _changeHover: function(actor, event, hover) {
      if(hover) {
         if(this._applet_icon)
            this._applet_icon.add_style_pseudo_class('hover');
         this._applet_label.add_style_pseudo_class('hover');
      } else {
         if(this._applet_icon)
            this._applet_icon.remove_style_pseudo_class('hover');
         this._applet_label.remove_style_pseudo_class('hover');
      }
   },

   _updateKeybinding: function() {
      if(this.lastOverlayKey) {
         Main.keybindingManager.removeHotKey(this.lastOverlayKey);
         this.lastOverlayKey = null;
      }
      let muffin_overlay_key;
      try {
         if(this.overlayKeyID) {
             global.display.disconnect(this.overlayKeyID);
             this.overlayKeyID = null;
         }
         let keybinding_menu = new Gio.Settings({ schema: "org.cinnamon.muffin" });
         if(keybinding_menu.list_keys().indexOf("overlay-key") != -1) {
            muffin_overlay_key = keybinding_menu.get_string("overlay-key");
            if(this.overlayKey.indexOf(muffin_overlay_key) != -1) {
               this.overlayKeyID = global.display.connect('overlay-key', Lang.bind(this, function() {
                  this._executeKeybinding();
                  return false;
               }));
            }
         }
      } catch(e) {}
      if(!this.overlayKeyID) {
         Main.keybindingManager.addHotKey("overlay-key", this.overlayKey, Lang.bind(this, function() {
            this._executeKeybinding();
            return false;
         }));
         this.lastOverlayKey = this.overlayKey;
      } else {
         let array = this.overlayKey.split("::");
         let newOverlayKey = "";
         for(let pos in array) {
            if(array[pos] != muffin_overlay_key) {
               newOverlayKey += array[pos] + "::";
            }
         }
         if(newOverlayKey != "") {
            newOverlayKey = newOverlayKey.substring(0, newOverlayKey.length - 2);
            Main.keybindingManager.addHotKey("overlay-key", newOverlayKey, Lang.bind(this, function() {
               this._executeKeybinding();
               return false;
            }));
            this.lastOverlayKey = newOverlayKey;
         }
      }
   },

   _executeKeybinding: function() {
      try {
         global.stage.set_key_focus(this.searchEntry);
         Mainloop.idle_add(Lang.bind(this, function() {
            this.menu.toggle_with_options(false);
         }));
         return true;
      }
      catch(e) {
         global.logError(e);
      }
      return false;
   },

   _updateIconAndLabel: function() {
      this.menuIconCustom = true;
      try {
         if((this.menuIcon == global.datadir + '/theme/menu.png')&&
            (!GLib.file_test(this.menuIcon, GLib.FileTest.EXISTS)))
            this.menuIcon = global.datadir + '/theme/menu.svg'

         if((this.menuIcon == "") || ((GLib.path_is_absolute(this.menuIcon)) &&
            (GLib.file_test(this.menuIcon, GLib.FileTest.EXISTS)))) {
            this.set_applet_icon_path(this.menuIcon);
         } else if (Gtk.IconTheme.get_default().has_icon(this.menuIcon)) {
            if(this.menuIcon.search("-symbolic") != -1)
               this.set_applet_icon_symbolic_name(this.menuIcon);
            else
               this.set_applet_icon_name(this.menuIcon);
         } else if(Gtk.IconTheme.get_default().has_icon("menu"))
            this.set_applet_icon_name("menu");
      } catch(e) {
         global.logWarning("Could not load icon file \""+this.menuIcon+"\" for menu button");
      }
      if(this.menuLabel != "")
         this.set_applet_label(_(this.menuLabel));
      else
         this.set_applet_label("");
   },

/* cinnamon 2.2
   onIconThemeChanged: function() {
        this._refreshApps();
        this._refreshFavs();
        this._refreshPlacesAndRecent;
   },
*/

   _isDirectory: function(fDir) {
      try {
         let info = fDir.query_filesystem_info("standard::type", null);
         if((info)&&(info.get_file_type() != Gio.FileType.DIRECTORY))
            return true;
      } catch(e) {
      }
      return false;
   },

   _makeDirectoy: function(fDir) {
      if(!this._isDirectory(fDir))
         this._makeDirectoy(fDir.get_parent());
      if(!this._isDirectory(fDir))
         fDir.make_directory(null);
   },

   execInstallLanguage: function() {
      try {
         let _shareFolder = GLib.get_home_dir() + "/.local/share/";
         let _localeFolder = Gio.file_new_for_path(_shareFolder + "locale/");
         let _moFolder = Gio.file_new_for_path(_shareFolder + "cinnamon/applets/" + this.uuid + "/locale/mo/");
         let children = _moFolder.enumerate_children('standard::name,standard::type,time::modified',
                                                     Gio.FileQueryInfoFlags.NONE, null);
         let info, child, _moFile, _moLocale, _moPath, _src, _dest, _modified, _destModified;
         while((info = children.next_file(null)) != null) {
            _modified = info.get_modification_time().tv_sec;
            if (info.get_file_type() == Gio.FileType.REGULAR) {
               _moFile = info.get_name();
               if (_moFile.substring(_moFile.lastIndexOf(".")) == ".mo") {
                  _moLocale = _moFile.substring(0, _moFile.lastIndexOf("."));
                  _moPath = _localeFolder.get_path() + "/" + _moLocale + "/LC_MESSAGES/";
                  _src = Gio.file_new_for_path(String(_moFolder.get_path() + "/" + _moFile));
                  _dest = Gio.file_new_for_path(String(_moPath + this.uuid + ".mo"));
                  try {
                     if(_dest.query_exists(null)) {
                        _destModified = _dest.query_info('time::modified', Gio.FileQueryInfoFlags.NONE, null).get_modification_time().tv_sec;
                        if((_modified > _destModified)) {
                           _src.copy(_dest, Gio.FileCopyFlags.OVERWRITE, null, null);
                        }
                     } else {
                         this._makeDirectoy(_dest.get_parent());
                         _src.copy(_dest, Gio.FileCopyFlags.OVERWRITE, null, null);
                     }
                  } catch(e) {
                     Main.notify("Error", e.message);
                  }
               }
            }
         }
      } catch(e) {
         Main.notify("Error", e.message);
      }
   },
//Config//
   _updateConfig: function() {
      this._readAccessiblePlaces();
      this._readAccessiblePlacesNames();
      this._readAccessibleApps();
      this._readAccessibleAppsNames();
      this._readAppsUsage();
      this._createArrayOfThemes();
      this._updateValues();
   },

   _updateValues: function() {
       let newSettingsThemes = this._readDefaultSettings();
       let newThemeConfig, oldPropTheme, settingPropTheme;
       for(let theme in this.themes) {
           settingPropTheme = this._getThemeProperties(newSettingsThemes[theme]);
           oldPropTheme = this._getThemeProperties(this.themes[theme]);
           for(let keyPropSetting in settingPropTheme) {
              if(!oldPropTheme[keyPropSetting]) {
                 oldPropTheme[keyPropSetting] = settingPropTheme[keyPropSetting];
              }
           }
           let newPropTheme = new Array();
           for(let keyPropOld in oldPropTheme) {
              if(settingPropTheme[keyPropOld]) {
                 newPropTheme[keyPropOld] = oldPropTheme[keyPropOld];
              }
           }
           newThemeConfig = this._makeThemeConvertion(newPropTheme);
           this.setThemeConfig(theme, newThemeConfig);
       }
   },

   _readDefaultSettings: function() {
      let newSettings = new Array();
      let new_json;
      try {
         let orig_file_path = GLib.get_home_dir() + "/.local/share/cinnamon/applets/" + this.uuid + "/settings-schema.json";
         let init_file_contents = Cinnamon.get_file_contents_utf8_sync(orig_file_path);
         new_json = JSON.parse(init_file_contents);
         for(let key in new_json) {
            if(new_json[key]["type"] == "generic") {
               if((new_json[key] != "list-places")&&(new_json[key] != "list-apps")&&
                  (new_json[key] != "list-places-names")&&(new_json[key] != "list-apps-names")&&(new_json[key] != "list-apps-usage")) {
                  newSettings[key] = new_json[key]["default"];
               }
            }
         }
      } catch (e) {
         global.logError("Problem parsing " + orig_file.get_path() + " while preparing to perform an upgrade.");
         global.logError("Skipping upgrade for now - something may be wrong with the new settings schema file.");
      }
      return newSettings;
   },

   _createArrayOfThemes: function() {
      this.themes = new Array();
      this.themes["classic"] = this.stringClassic;
      this.themes["classicGnome"] = this.stringClassicGnome;
      this.themes["whisker"] = this.stringWhisker;
      this.themes["kicker"] = this.stringKicker;
      this.themes["gnomenuLeft"] = this.stringGnoMenuLeft;
      this.themes["gnomenuRight"] = this.stringGnoMenuRight;
      this.themes["gnomenuTop"] = this.stringGnoMenuTop;
      this.themes["gnomenuBottom"] = this.stringGnoMenuBottom;
      this.themes["vampire"] = this.stringVampire;
      this.themes["garibaldo"] = this.stringGaribaldo;
      this.themes["stylized"] = this.stringStylized;
      this.themes["dragon"] = this.stringDragon;
      this.themes["dragonInverted"] = this.stringDragonInverted;
      this.themes["luzHelena"] = this.stringLuzHelena;
      this.themes["accessible"] = this.stringAccessible;
      this.themes["accessibleInverted"] = this.stringAccessibleInverted;
      this.themes["mint"] = this.stringMint;
      this.themes["windows7"] = this.stringWindows7;
   },

   _saveTheme: function(theme) {
      switch(theme) {
         case "classic"            :
            this.stringClassic = this.themes["classic"];
            break;
         case "classicGnome"       :
            this.stringClassicGnome = this.themes["classicGnome"];
            break;
         case "whisker"            :
            this.stringWhisker = this.themes["whisker"];
            break;
         case "kicker"            :
            this.stringKicker = this.themes["kicker"];
            break;
         case "gnomenuLeft"        :
            this.stringGnoMenuLeft = this.themes["gnomenuLeft"];
            break;
         case "gnomenuRight"       :
            this.stringGnoMenuRight = this.themes["gnomenuRight"];
            break;
         case "gnomenuTop"         :
            this.stringGnoMenuTop = this.themes["gnomenuTop"];
            break;
         case "gnomenuBottom"      :
            this.stringGnoMenuBottom = this.themes["gnomenuBottom"];
            break;
         case "vampire"            :
            this.stringVampire = this.themes["vampire"];
            break;
         case "garibaldo"          :
            this.stringGaribaldo = this.themes["garibaldo"];
            break;
         case "stylized"           :
            this.stringStylized = this.themes["stylized"];
            break;
         case "dragon"             :
            this.stringDragon = this.themes["dragon"];
            break;
         case "dragonInverted"     :
            this.stringDragonInverted = this.themes["dragonInverted"];
            break;
         case "luzHelena"          :
            this.stringLuzHelena = this.themes["luzHelena"];
            break;
         case "accessible"         :
            this.stringAccessible = this.themes["accessible"];
            break;
         case "accessibleInverted" :
            this.stringAccessibleInverted = this.themes["accessibleInverted"];
            break;
         case "mint"               :
            this.stringMint = this.themes["mint"];
            break;
         case "windows7"           :
            this.stringWindows7 = this.themes["windows7"];
            break;
      }
   },

   _readAccessiblePlaces: function() {
      this.places = this.stringPlaces.split(";;");
      let pos = 0;
      while(pos < this.places.length) {
         if((this.places[pos] == "")||(!this._isBookmarks(this.places[pos])))
            this.places.splice(pos, 1);
         else
            pos++;
      }
   },

   _readAccessiblePlacesNames: function() {
      let placesNamesList = this.stringPlacesNames.split(";;");
      this.placesNames = new Array();
      let property;
      for(let i = 0; i < placesNamesList.length; i++) {
         property = placesNamesList[i].split("::");
         if((property[0] != "")&&(property[1] != "")&&(this.places.indexOf(property[0]) != -1)) {
            this.placesNames[property[0]] = property[1];
         }
      }
   },

   _readAccessibleApps: function() {
      this.apps = this.stringApps.split(";;");
      let appSys = Cinnamon.AppSystem.get_default();
      let pos = 0;
      while(pos < this.apps.length) {
         if((this.apps[pos] == "")||(!appSys.lookup_app(this.apps[pos])))
            this.apps.splice(pos, 1);
         else
            pos++;
      }
   },

   _readAccessibleAppsNames: function() {
      let appsNamesList = this.stringAppsNames.split(";;");
      this.appsNames = new Array();
      let property;
      for(let i = 0; i < appsNamesList.length; i++) {
         property = appsNamesList[i].split("::");
         if((property[0] != "")&&(property[1] != "")&&(this.apps.indexOf(property[0]) != -1)) {
            this.appsNames[property[0]] = property[1];
         }
      }
   },

   _readAppsUsage: function() {
      let appsNamesList = this.stringAppsUsage.split(";;");
      this.appsUsage = new Array();
      let property, value;
      let appSys = Cinnamon.AppSystem.get_default();
      for(let i = 0; i < appsNamesList.length; i++) {
         property = appsNamesList[i].split("::");
         if((property[0] != "")&&(property[1] != "")&&(appSys.lookup_app(property[0]))) {
            try {
               value = parseInt(property[1]);
               this.appsUsage[property[0]] = value;
            } catch(e){}//exclude only the app do not report any thing.
         }
      }
   },

   setAppsUsage: function(listAppsUsage) {
      let result = "";
      this.appsUsage = new Array();
      let appSys = Cinnamon.AppSystem.get_default();
      for(let id in listAppsUsage) {
         if((id != "")&&(listAppsUsage[id].toString() != "")&&(appSys.lookup_app(id))) {
            this.appsUsage[id] = listAppsUsage[id].toString();
            result += id+"::"+listAppsUsage[id].toString() + ";;";
         }
      }
      this.stringAppsUsage = result.substring(0, result.length - 2);//commit
   },

   _isBookmarks: function(bookmark) {
      let listBookmarks = this._listBookmarks();
      for(let i = 0; i < listBookmarks.length; i++) {
         if(listBookmarks[i].id == bookmark)
            return true;
      }
      return false;
   },

   getPlacesList: function() {
      return this.places;
   },

   setPlacesList: function(listPlaces) {
      let result = "";
      this.places = new Array();
      for(let i = 0; i < listPlaces.length - 1; i++) {
         if((listPlaces[i] != "")&&(this._isBookmarks(listPlaces[i]))&&(this.places.indexOf(listPlaces[i]) == -1)) {
            this.places.push(listPlaces[i]);
            result += listPlaces[i] + ";;";
         }
      }
      if(listPlaces.length > 0) {
         let last = listPlaces[listPlaces.length-1];
         if((last != "")&&(this._isBookmarks(last))&&(this.places.indexOf(last) == -1)) {
            this.places.push(last);
            result += last;
         }
      }
      this.stringPlaces = result;//commit
      this.setPlacesNamesList(this.getPlacesNamesList());
   },

   isInPlacesList: function(placeId) {
      return (this.places.indexOf(placeId) != -1);
   },

   getPlacesNamesList: function() {
      let newPlacesNames = new Array();
      for(let id in this.placesNames) {
         if(this.places.indexOf(id) != -1)
            newPlacesNames[id] = this.placesNames[id];
      }
      return newPlacesNames;
   },

   setPlacesNamesList: function(listPlacesNames) {
      let result = "";
      this.placesNames = new Array();
      for(let id in listPlacesNames) {
         if((id != "")&&(listPlacesNames[id].toString() != "")&&(this.places.indexOf(id) != -1)) {
            this.placesNames[id] = listPlacesNames[id];
            result += id+"::"+listPlacesNames[id].toString() + ";;";
         }
      }
      this.stringPlacesNames = result.substring(0, result.length - 2);//commit
      this._onChangeAccessible();
   },

   changePlaceName: function(placeId, newName) {
      if(this.places.indexOf(placeId) != -1) {
         if(newName != "") {
            this.placesNames[placeId] = newName;
            this.setPlacesNamesList(this.placesNames);
         }
         else {
            let newPlaces = new Array();
            for(let id in this.placesNames) {
               if(id != placeId)
                 newPlaces[id] = this.placesNames[id];
            }
            this.setPlacesNamesList(newPlaces);
         }
      }
   },

   getAppsNamesList: function() {
      let newAppsNames = new Array();
      for(let id in this.appsNames) {
         if(this.apps.indexOf(id) != -1)
            newAppsNames[id] = this.appsNames[id];
      }
      return newAppsNames;
   },

   setAppsNamesList: function(listAppsNames) {
      let result = "";
      this.appsNames = new Array();
      for(let id in listAppsNames) {
         if((id != "")&&(listAppsNames[id].toString() != "")&&(this.apps.indexOf(id) != -1)) {
            this.appsNames[id] = listAppsNames[id].toString();
            result += id+"::"+listAppsNames[id].toString() + ";;";
         }
      }
      this.stringAppsNames = result.substring(0, result.length - 2);//commit
      this._onChangeAccessible();
   },

   changeAppName: function(appId, newName) {
      if(this.apps.indexOf(appId) != -1) {
         if(newName != "") {
            this.appsNames[appId] = newName;
            this.setAppsNamesList(this.appsNames);
         }
         else {
            let newApps = new Array();
            for(let id in this.appsNames) {
               if(id != appId)
                 newApps[id] = this.appsNames[id];
            }
            this.setAppsNamesList(newApps);
         }
      }
   },

   getAppsList: function() {
      return this.apps;
   },

   setAppsList: function(listApps) {
      let result = "";
      this.apps = new Array();
      for(let i = 0; i < listApps.length - 1; i++) {
         if(listApps[i] != "") {
            result += listApps[i] + ";;";
            this.apps.push(listApps[i]);
         }
      }
      if((listApps.length > 0)&&(listApps[listApps.length-1] != "")) {
         result += listApps[listApps.length-1];
         this.apps.push(listApps[listApps.length-1]);
      }
      this.stringApps = result;//commit
      this.setAppsNamesList(this.getAppsNamesList());
   },

   isInAppsList: function(appId) {
      return (this.apps.indexOf(appId) != -1);
   },

   getThemeConfig: function(themeString) {
      let themeProperties = this._getThemeProperties(themeString)
      return this._makeThemeConvertion(themeProperties);
   },

   _getThemeProperties: function(themeString) {
      let themeList = themeString.split(";;");
      let themeProperties = new Array();
      let property;
      for(let i = 0; i < themeList.length; i++) {
         property = themeList[i].split("::");
         themeProperties[property[0]] = property[1];
      }
      return themeProperties;
   },

   _makeThemeConvertion: function(themeProperties) {
      themeProperties["show-recent"] = (themeProperties["show-recent"] === 'true');
      themeProperties["show-places"] = (themeProperties["show-places"] === 'true');
      themeProperties["allow-search"] = (themeProperties["allow-search"] === 'true');
      //themeProperties["search-sorted"] = (themeProperties["search-sorted"] === 'true');;
      //themeProperties["search-filesystem"] = (themeProperties["search-filesystem"] === 'true');
      themeProperties["swap-panels"] = (themeProperties["swap-panels"] === 'true');
      themeProperties["activate-on-hover"] = (themeProperties["activate-on-hover"] === 'true');
      themeProperties["categories-hover"] = (themeProperties["categories-hover"] === 'true');
      themeProperties["hover-delay"] = parseInt(themeProperties["hover-delay"]);
      themeProperties["enable-autoscroll"] = (themeProperties["enable-autoscroll"] === 'true');
      themeProperties["show-view-item"] = (themeProperties["show-view-item"] === 'true');
      themeProperties["control-symbolic"] = (themeProperties["control-symbolic"] === 'true');
      themeProperties["power-symbolic"] = (themeProperties["power-symbolic"] === 'true');
      themeProperties["view-item"] = (themeProperties["view-item"] === 'true');
      themeProperties["hover-box"] = (themeProperties["hover-box"] === 'true');
      themeProperties["control-box"] = (themeProperties["control-box"] === 'true');
      themeProperties["power-box"] = (themeProperties["power-box"] === 'true');
      themeProperties["accessible-box"] = (themeProperties["accessible-box"] === 'true');
      themeProperties["gnomenu-box"] = (themeProperties["gnomenu-box"] === 'true');
      themeProperties["show-removable-drives"] = (themeProperties["show-removable-drives"] === 'true');
      themeProperties["accessible-icons"] = (themeProperties["accessible-icons"] === 'true');
      themeProperties["categories-icons"] = (themeProperties["categories-icons"] === 'true');
      themeProperties["app-button-width"] = parseInt(themeProperties["app-button-width"]);
      themeProperties["app-description"] = (themeProperties["app-description"] === 'true');
      themeProperties["icon-app-size"] = parseInt(themeProperties["icon-app-size"]);
      themeProperties["icon-cat-size"] = parseInt(themeProperties["icon-cat-size"]);
      themeProperties["icon-max-fav-size"] = parseInt(themeProperties["icon-max-fav-size"]);
      themeProperties["icon-power-size"] = parseInt(themeProperties["icon-power-size"]);
      themeProperties["icon-control-size"] = parseInt(themeProperties["icon-control-size"]);
      themeProperties["icon-hover-size"] = parseInt(themeProperties["icon-hover-size"]);
      themeProperties["icon-accessible-size"] = parseInt(themeProperties["icon-accessible-size"]);
      themeProperties["icon-gnomenu-size"] = parseInt(themeProperties["icon-gnomenu-size"]);
      themeProperties["show-favorites"] = (themeProperties["show-favorites"] === 'true');
      themeProperties["favorites-lines"] = parseInt(themeProperties["favorites-lines"]);
      themeProperties["show-hover-icon"] = (themeProperties["show-hover-icon"] === 'true');
      themeProperties["show-power-buttons"] = (themeProperties["show-power-buttons"] === 'true');
      themeProperties["show-time-date"] = (themeProperties["show-time-date"] === 'true');
      themeProperties["show-app-title"] = (themeProperties["show-app-title"] === 'true');
      themeProperties["app-title-size"] = parseInt(themeProperties["app-title-size"]);
      themeProperties["show-app-description"] = (themeProperties["show-app-description"] === 'true');
      themeProperties["app-description-size"] = parseInt(themeProperties["app-description-size"]);
      themeProperties["automatic-size"] = (themeProperties["automatic-size"] === 'true');
      themeProperties["allow-resizing"] = (themeProperties["allow-resizing"] === 'true');
      themeProperties["full-screen"] = (themeProperties["full-screen"] === 'true');
      themeProperties["width"] = parseInt(themeProperties["width"]);
      themeProperties["height"] = parseInt(themeProperties["height"]);
      themeProperties["scroll-favorites"] = (themeProperties["scroll-favorites"] === 'true');
      themeProperties["scroll-categories"] = (themeProperties["scroll-categories"] === 'true');
      themeProperties["arrow-categories"] = (themeProperties["arrow-categories"] === 'true');
      themeProperties["arrow-categories-selected"] = (themeProperties["arrow-categories-selected"] === 'true');
      themeProperties["scroll-applications"] = (themeProperties["scroll-applications"] === 'true');
      themeProperties["scroll-accessible"] = (themeProperties["scroll-accessible"] === 'true');
      themeProperties["scroll-gnomenu"] = (themeProperties["scroll-gnomenu"] === 'true');
      themeProperties["spacer-line"] = (themeProperties["spacer-line"] === 'true');
      themeProperties["spacer-size"] = parseInt(themeProperties["spacer-size"]);
      themeProperties["show-box-pointer"] = (themeProperties["show-box-pointer"] === 'true');
      themeProperties["fix-menu-corner"] = (themeProperties["fix-menu-corner"] === 'true');
      return themeProperties;
   },

   setThemeConfig: function(theme, properties) {
      let result = "";
      for(let key in properties)
         result += key+"::"+properties[key].toString() + ";;";
      this.themes[theme] = result.substring(0, result.length - 2);
      this._saveTheme(theme);
   },
//Config//
   _updateAppFavs: function() {
      Mainloop.idle_add(Lang.bind(this, function() {
         this._refreshFavs();
      }));
   },

   _onAppsChange: function() {
      this._onSearchEnginesChanged();
      this._refreshApps();
      this._updateAppButtonDesc();
      this._updateTextButtonWidth();
      this._setAppIconDirection();
      this._updateAppSize();
      this._updateSize();
   },

   _onChangeAccessible: function() {
      if(this.accessibleBox) {
         this.accessibleBox.refreshAccessibleItems();
      }
   },

   on_orientation_changed: function(orientation) {
      this.orientation = orientation;
      if(this.orientation == St.Side.TOP)
         this.actor.add_style_class_name('menu-applet-panel-top-box');
      else
         this.actor.add_style_class_name('menu-applet-panel-bottom-box');
      Mainloop.idle_add(Lang.bind(this, function() {
         this._updateMenuSection();
         this._updateComplete();
      }));
      return true;
   },

   _onChangeCinnamonTheme: function() {
      this.separatorTop.actor.visible = true;
      this.separatorMiddle.actor.visible = true;
      this.separatorBottom.actor.visible = true;
      Mainloop.idle_add(Lang.bind(this, this._updateSize));
   },

   _onMenuKeyPress: function(actor, event) {
      try {
        this.destroyVectorBox();
        let symbol = event.get_key_symbol();
        let item_actor;
        this.appBoxIter.reloadVisible();
        this.catBoxIter.reloadVisible();

        let keyCode = event.get_key_code();
        let modifierState = Cinnamon.get_event_state(event);

        /* check for a keybinding and quit early, otherwise we get a double hit
           of the keybinding callback */
        let action = global.display.get_keybinding_action(keyCode, modifierState);
        if(action == Meta.KeyBindingAction.CUSTOM) {
           return true;
        }

        if((global.display.get_is_overlay_key)&&(global.display.get_is_overlay_key(keyCode, modifierState))) {
           if(this.menu.isOpen) {
              this._disconnectSearch();
              this.menu.close();
              return true;
           }
        }
        if((this.appletMenu)&&(actor == this.appletMenu.actor)) {
           return this._navegateAppletMenu(symbol, actor);
        } else if(actor._delegate instanceof MenuItems.FavoritesButton) {
           return this._navegateFavBox(symbol, actor);
        } else if(actor == this.powerBox.actor) {
           return this._navegatePowerBox(symbol, actor); 
        } else if((this.accessibleBox)&&(actor == this.accessibleBox.actor)) {
           return this._navegateAccessibleBox(symbol, actor); 
        } else if((this.gnoMenuBox)&&(actor == this.gnoMenuBox.actor)) {
           return this._navegateGnoMenuBox(symbol, actor); 
        } else if((this.bttChanger)&&(actor == this.bttChanger.actor)) {
           return this._navegateBttChanger(symbol);
        } else if(actor == this.hover.actor) {
           return this._navegateHoverIcon(symbol, actor);
        } else if(actor == this.hover.menu.actor) {
           return this._navegateHoverMenu(symbol, actor);
        } else if(this._activeContainer === null) {
           item_actor = this._navegationInit(symbol);
        } else if(this._activeContainer == this.applicationsBox) {
           item_actor = this._navegateAppBox(symbol, this._selectedItemIndex, this._selectedCategoryIndex, this._selectedRowIndex);
        } else if(this._activeContainer == this.categoriesBox) {
           item_actor = this._navegateCatBox(symbol, this._selectedRowIndex);
        } else if (this.searchFilesystem && (this._fileFolderAccessActive || symbol == Clutter.slash)) {
           return this._searchFileSystem(symbol);
        } else {
           return false;
        }
        if((!item_actor)||(item_actor == this.searchEntry)) {
           return false;
        }
        //Main.notify("Item:" + item_actor._delegate);
        if(item_actor._delegate) {
           item_actor._delegate.emit('enter-event');
           return true;
        }
      }
      catch(e) {
        Main.notify("ErrorKey", e.message);
      }
      return false;
   },

   _changeFocusElement: function(elementActive) {
      let tbttChanger = null;
      let staticB = null;
      let favElem = null;
      let gnoMenu = null;
      let favActor = this.favoritesObj.getFirstElement();
      let appletMenuActor = null;
      if(this.bttChanger) tbttChanger = this.bttChanger.actor;
      if(this.accessibleBox) staticB = this.accessibleBox.actor;
      if(favActor) favElem = this.favoritesScrollBox.actor;
      if(this.appletMenu) appletMenuActor = this.appletMenu.actor;
      if(this.gnoMenuBox) gnoMenu = this.gnoMenuBox.actor;
      let activeElements = [this.hover.actor, staticB, gnoMenu, this.powerBox.actor, tbttChanger, this.searchEntry, appletMenuActor, favElem];
      let actors = [this.hover.actor, staticB, gnoMenu, this.powerBox.actor, tbttChanger, this.searchEntry, appletMenuActor, favActor];
      let index = actors.indexOf(elementActive);
      let selected = index + 1;
      while((selected < activeElements.length)&&((!activeElements[selected])||(!activeElements[selected].visible))) {
         selected++;
      }
      if(selected < activeElements.length) {
         return actors[selected];
      }
      let selected = 0;
      while((selected < index)&&((!activeElements[selected])||(!activeElements[selected].visible))) {
         selected++;
      }
      this.hover.refreshFace();
      this.selectedAppBox.setSelectedText("", "");
      if(actors[selected] == favActor)
         this.favoritesObj.activeHoverElement(favActor);
      return actors[selected];
   },

   _getApplicationScapeKey: function() {
      if((this.theme == "whisker")||(this.theme == "gnomenuRight"))
         return Clutter.KEY_Right;
      if((this.theme == "gnomenuTop")||(this.theme == "luzHelena")||(this.theme == "dragon")||(this.theme == "dragonInverted"))
         return Clutter.KEY_Up;
      if(this.theme == "gnomenuBottom")
         return Clutter.KEY_Down;
      return Clutter.KEY_Left;
   },

   _getCategoryScapeKey: function() {
      if(this.theme == "whisker")
         return Clutter.KEY_Left;
      if((this.theme == "gnomenuTop")||(this.theme == "luzHelena")||(this.theme == "dragon")||(this.theme == "dragonInverted"))
         return Clutter.KEY_Down;
      if(this.theme == "gnomenuBottom")
         return Clutter.KEY_Up;
      return Clutter.KEY_Right;
   },

   _run: function(input) {
      let command = input;

      this._commandError = false;
      if(input) {
         let path = null;
         if(input.charAt(0) == '/') {
            path = input;
         } else {
            if(input.charAt(0) == '~')
               input = input.slice(1);
            path = GLib.get_home_dir() + '/' + input;
         }

         if(GLib.file_test(path, GLib.FileTest.EXISTS)) {
            let file = Gio.file_new_for_path(path);
            try {
               Gio.app_info_launch_default_for_uri(file.get_uri(),
                                                   global.create_app_launch_context());
            } catch(e) {
               // The exception from gjs contains an error string like:
               //     Error invoking Gio.app_info_launch_default_for_uri: No application
               //     is registered as handling this file
               // We are only interested in the part after the first colon.
               //let message = e.message.replace(/[^:]*: *(.+)/, '$1');
               return false;
            }
         } else {
            return false;
         }
      }

      return true;
   },

   _searchFileSystem: function(symbol) {
      if(symbol == Clutter.Return || symbol == Clutter.KP_Enter) {
         if(this._run(this.searchEntry.get_text())) {
            this.menu.close();
         }
         return true;
      }
      else if(symbol == Clutter.slash) {
         // Need preload data before get completion. GFilenameCompleter load content of parent directory.
         // Parent directory for /usr/include/ is /usr/. So need to add fake name('a').
         let text = this.searchEntry.get_text().concat('/a');
         let prefix;
         if(text.lastIndexOf(' ') == -1)
            prefix = text;
         else
            prefix = text.substr(text.lastIndexOf(' ') + 1);
         this._getCompletion(prefix);

         return false;
      }
      else if(symbol == Clutter.Tab) {
         let text = actor.get_text();
         let prefix;
         if(text.lastIndexOf(' ') == -1)
            prefix = text;
         else
            prefix = text.substr(text.lastIndexOf(' ') + 1);
         let postfix = this._getCompletion(prefix);
         if(postfix != null && postfix.length > 0) {
            actor.insert_text(postfix, -1);
            actor.set_cursor_position(text.length + postfix.length);
            if(postfix[postfix.length - 1] == '/')
               this._getCompletion(text + postfix + 'a');
         }
         return true;
      }
      else if(symbol == Clutter.Escape) {
         this.searchEntry.set_text('');
         this._fileFolderAccessActive = false;
      }
      return false;
   },

   _navegationInit: function(symbol) {
      let item_actor;
      this._previousTreeSelectedActor = this.catBoxIter.getFirstVisible();
      if((symbol == Clutter.Tab)||(!this._previousTreeSelectedActor)) {
         this.fav_actor = this._changeFocusElement(this.searchEntry);
         Mainloop.idle_add(Lang.bind(this, this._putFocus));
         item_actor = this.searchEntry;
      } else if((symbol == Clutter.KEY_Right)||(symbol == Clutter.KEY_Left)||(symbol == Clutter.KEY_Up)||(symbol == Clutter.KEY_Down)) {
         if(!this.operativePanel.visible) {
            this.fav_actor = this._changeFocusElement(this.searchEntry);
            Mainloop.idle_add(Lang.bind(this, this._putFocus));
            item_actor = this.searchEntry;
            return item_actor;
         }
         this._activeContainer = this.applicationsBox;
        // this._previousSelectedActor = this.applicationsBox.get_child_at_index(0).get_child_at_index(0);
         this._previousSelectedActor = this.appBoxIter.getAppAt(0, 0, 0);
         if(this._previousTreeSelectedActor)
            this._previousTreeSelectedActor._delegate.emit('enter-event');
         item_actor = this.appBoxIter.getFirstVisible();
         this._selectedItemIndex = this.appBoxIter.getAbsoluteIndexOfChild(item_actor);
         this._selectedCategoryIndex = this.appBoxIter.getCategoryIndexOfChild(item_actor);
         this._selectedRowIndex = this.appBoxIter.getInternalIndexOfChild(item_actor);
      }
      return item_actor;
   },

   _navegateAppBox: function(symbol, index, catIndex, rowIndex) {
      let item_actor;
      if((!this.operativePanel.visible)||(!this.catBoxIter.getFirstVisible())) {
         this.fav_actor = this._changeFocusElement(this.searchEntry);
         Mainloop.idle_add(Lang.bind(this, this._putFocus));
         item_actor = this.searchEntry;
         return item_actor;
      }
      let scapeKey = this._getApplicationScapeKey();
      
      if(symbol == Clutter.Tab) {
         this.fav_actor = this._changeFocusElement(this.searchEntry);
         Mainloop.idle_add(Lang.bind(this, this._putFocus));
         item_actor = this.searchEntry;
      }
      else if((symbol == scapeKey)&&(this.appBoxIter.isInBorder(catIndex, index, rowIndex, scapeKey))) {//&& !this.searchActive
         if(this._previousTreeSelectedActor)
            this._previousTreeSelectedActor._delegate.emit('enter-event');
         this._previousSelectedActor = this.appBoxIter.getAppAt(catIndex, index, 0);
         item_actor = (this._previousTreeSelectedActor) ? this._previousTreeSelectedActor : this.catBoxIter.getFirstVisible();
         index = this.catBoxIter.getAbsoluteIndexOfChild(item_actor);
         this._previousTreeSelectedActor = item_actor;
         this.categoriesScrollBox.scrollToActor(item_actor);
         this.hover.refreshFace();
         this.selectedAppBox.setSelectedText("", "");
      }
      else if(symbol == Clutter.KEY_Up) {
         this._previousSelectedActor = this.appBoxIter.getAppAt(catIndex, index, 2*rowIndex);
         item_actor = this.appBoxIter.getPrevVisible(this._previousSelectedActor);
         this._previousVisibleIndex = this.appBoxIter.getVisibleIndex(item_actor);
         index = this.appBoxIter.getAbsoluteIndexOfChild(item_actor);
         this.applicationsScrollBox.scrollToActor(item_actor._delegate.actor);
      } 
      else if(symbol == Clutter.KEY_Down) {
         this._previousSelectedActor = this.appBoxIter.getAppAt(catIndex, index, 2*rowIndex);
         item_actor = this.appBoxIter.getNextVisible(this._previousSelectedActor);
         this._previousVisibleIndex = this.appBoxIter.getVisibleIndex(item_actor);
         index = this.appBoxIter.getAbsoluteIndexOfChild(item_actor);
         this.applicationsScrollBox.scrollToActor(item_actor._delegate.actor);
      }
      else if(symbol == Clutter.KEY_Right) {
         if(this._previousTreeSelectedActor)
            this._previousTreeSelectedActor._delegate.emit('enter-event');
         this._previousSelectedActor = this.appBoxIter.getAppAt(catIndex, index, 2*rowIndex);
         item_actor = this.appBoxIter.getRightVisible(this._previousSelectedActor);
         this._previousVisibleIndex = this.appBoxIter.getVisibleIndex(item_actor);
         index = this.appBoxIter.getAbsoluteIndexOfChild(item_actor);
         this.applicationsScrollBox.scrollToActor(item_actor._delegate.actor);
      }
      else if(symbol == Clutter.KEY_Left) {//&& !this.searchActive
         if(this._previousTreeSelectedActor)
            this._previousTreeSelectedActor._delegate.emit('enter-event');
         this._previousSelectedActor = this.appBoxIter.getAppAt(catIndex, index, 2*rowIndex);
         item_actor = this.appBoxIter.getLeftVisible(this._previousSelectedActor);
         this._previousVisibleIndex = this.appBoxIter.getVisibleIndex(item_actor);
         index = this.appBoxIter.getAbsoluteIndexOfChild(item_actor);
         this.applicationsScrollBox.scrollToActor(item_actor._delegate.actor);
      } 
      else if((symbol == Clutter.KEY_Return) || (symbol == Clutter.KP_Enter)) {
         item_actor = this.appBoxIter.getAppAt(catIndex, index, 2*rowIndex);
         item_actor._delegate.activate();
      }
      this._selectedItemIndex = index;
      return item_actor;
   },

   _navegateCatBox: function(symbol, index) {
      let item_actor = null;
      if((!this.operativePanel.visible)||(!this.catBoxIter.getFirstVisible())) {
         this.fav_actor = this._changeFocusElement(this.searchEntry);
         Mainloop.idle_add(Lang.bind(this, this._putFocus));
         item_actor = this.searchEntry;
         return item_actor;
      }
      let scapeKey = this._getCategoryScapeKey();
      if(symbol == Clutter.Tab) {
         this.fav_actor = this._changeFocusElement(this.searchEntry);
         Mainloop.idle_add(Lang.bind(this, this._putFocus));
         item_actor = this.searchEntry;
      } 
      else if(!this.gnoMenuBox) {
         if(this.categoriesBox.get_vertical()) {
            if(symbol == Clutter.KEY_Up) {
               this._previousTreeSelectedActor = this.catBoxIter.getAppAt(0, 0, index);
               this._previousTreeSelectedActor._delegate.isHovered = false;
               item_actor = this.catBoxIter.getPrevVisible(this._activeActor);
               index = this.catBoxIter.getAbsoluteIndexOfChild(item_actor);
               this.categoriesScrollBox.scrollToActor(item_actor);
            }
            else if(symbol == Clutter.KEY_Down) {
               this._previousTreeSelectedActor = this.catBoxIter.getAppAt(0, 0, index);
               this._previousTreeSelectedActor._delegate.isHovered = false;
               item_actor = this.catBoxIter.getNextVisible(this._activeActor);
               index = this.catBoxIter.getAbsoluteIndexOfChild(item_actor);
               this._previousTreeSelectedActor._delegate.emit('leave-event');
               this.categoriesScrollBox.scrollToActor(item_actor);
            }
            else if(symbol == scapeKey) {// && (this._activeContainer !== this.applicationsBox)
               if(this._previousVisibleIndex !== null) {
                  item_actor = this.appBoxIter.getVisibleItem(this._previousVisibleIndex);
               } else {
                  item_actor = this.appBoxIter.getFirstVisible();
               }
               index = this.appBoxIter.getAbsoluteIndexOfChild(item_actor);
            }
         } else {
            if(symbol == Clutter.KEY_Right) {
               this._previousTreeSelectedActor = this.catBoxIter.getAppAt(0, 0, index);
               this._previousTreeSelectedActor._delegate.isHovered = false;
               item_actor = this.catBoxIter.getNextVisible(this._activeActor);
               index = this.catBoxIter.getAbsoluteIndexOfChild(item_actor);
               this._previousTreeSelectedActor._delegate.emit('leave-event');
               this.categoriesScrollBox.scrollToActor(item_actor);
            }
            else if(symbol == Clutter.KEY_Left) {
               this._previousTreeSelectedActor = this.catBoxIter.getAppAt(0, 0, index);
               this._previousTreeSelectedActor._delegate.isHovered = false;
               item_actor = this.catBoxIter.getPrevVisible(this._activeActor);
               index = this.catBoxIter.getAbsoluteIndexOfChild(item_actor);
               this.categoriesScrollBox.scrollToActor(item_actor);
            }
            else if(symbol == scapeKey) {// && (this._activeContainer !== this.applicationsBox)
               if(this._previousVisibleIndex !== null) {
                  item_actor = this.appBoxIter.getVisibleItem(this._previousVisibleIndex);
               } else {
                  item_actor = this.appBoxIter.getFirstVisible();
               }
               index = this.appBoxIter.getAbsoluteIndexOfChild(item_actor);
            }
         }
         this._selectedItemIndex = index;
      }
      if(!item_actor)
        item_actor = this.searchEntry;
      return item_actor;
   },

   _navegateAppletMenu: function(symbol, actor) {
      if(this.appletMenu) {
         if(symbol == Clutter.Tab) {
            this.fav_actor = this._changeFocusElement(actor);
            Mainloop.idle_add(Lang.bind(this, this._putFocus));
            this.favoritesObj.activeHoverElement();
            return true;
         } else {
            this.appletMenu.navegateAppletMenu(symbol, actor);
            return true;
         }
      }
      return true;
   },

   _navegateFavBox: function(symbol, actor) {
      this.fav_actor = actor;
      if(symbol == Clutter.Tab) {
         this.fav_actor = this._changeFocusElement(this.favoritesScrollBox.actor);
         Mainloop.idle_add(Lang.bind(this, this._putFocus));
         this.favoritesObj.activeHoverElement();
         return true;
      } else {
         if((this.gnoMenuBox)&&(this._gnoMenuNavegationInvertedKey() == symbol)&&
            (this.favoritesObj.isInBorder(symbol, this.fav_actor))) {
            this.favoritesObj.activeHoverElement();
            this.fav_actor = this.gnoMenuBox.actor;
            Mainloop.idle_add(Lang.bind(this, this._putFocus));
            return true;
         }
         this.fav_actor = this.favoritesObj.navegateFavBox(symbol, actor);
         if(this.fav_actor) {
            let fav_obj = this.fav_actor._delegate;
            if(fav_obj) {
               if((symbol == Clutter.KEY_Return) || (symbol == Clutter.KP_Enter)) {
                  fav_obj.activate();
                  return true;
               }
               this.hover.refreshApp(fav_obj.app);
               if(fav_obj.app.get_description())
                  this.selectedAppBox.setSelectedText(fav_obj.app.get_name(), fav_obj.app.get_description().split("\n")[0]);
               else
                  this.selectedAppBox.setSelectedText(fav_obj.app.get_name(), "");
            }
            this.favoritesScrollBox.scrollToActor(this.fav_actor);
            this.favoritesObj.activeHoverElement(this.fav_actor);
         }
         return true;
      }
   },

   _navegatePowerBox: function(symbol, actor) {
      if(symbol == Clutter.Tab) {
         this.powerBox.disableSelected();
         this.fav_actor = this._changeFocusElement(this.powerBox.actor);
         //global.stage.set_key_focus(this.fav_actor);
         Mainloop.idle_add(Lang.bind(this, this._putFocus));
      }
      else {
         this.powerBox.navegatePowerBox(symbol, actor);
      }
      return true;
   },

   _navegateAccessibleBox: function(symbol, actor) {
      if(symbol == Clutter.Tab) {
         this.accessibleBox.disableSelected();
         this.fav_actor = this._changeFocusElement(this.accessibleBox.actor);
         //global.stage.set_key_focus(this.fav_actor);
         Mainloop.idle_add(Lang.bind(this, this._putFocus));
      }
      else {
         return this.accessibleBox.navegateAccessibleBox(symbol, actor);
      }
      return true;
   },

   _navegateGnoMenuBox: function(symbol, actor) {
      let gnoKey = this._gnoMenuNavegationKey();
      if(symbol == Clutter.Tab) {
         this.gnoMenuBox.disableSelected();
         this.fav_actor = this._changeFocusElement(this.gnoMenuBox.actor);
         //global.stage.set_key_focus(this.fav_actor);
         Mainloop.idle_add(Lang.bind(this, this._putFocus));
      }
      else if((this._activeContainer == this.applicationsBox)||(symbol == gnoKey)) {
         let item_actor;
         if(this._activeContainer == null) {
            item_actor = this._navegationInit(symbol);
         } else if(this._activeContainer == this.categoriesBox) {
            if(symbol == gnoKey) {
               if(this._previousVisibleIndex !== null) {
                  item_actor = this.appBoxIter.getVisibleItem(this._previousVisibleIndex);
               } else {
                  item_actor = this.appBoxIter.getFirstVisible();
               }
               index = this.appBoxIter.getAbsoluteIndexOfChild(item_actor);
            }
            this._selectedItemIndex = index;
         } else if(this._activeContainer == this.applicationsBox) {
            item_actor = this._navegateAppBox(symbol, this._selectedItemIndex, this._selectedCategoryIndex, this._selectedRowIndex);
         }
         let copyPreviousTreeSelectedActor = this._previousTreeSelectedActor;
         if((item_actor)&&(item_actor._delegate))
            item_actor._delegate.emit('enter-event');
         this._previousTreeSelectedActor = copyPreviousTreeSelectedActor;
         if(this._activeContainer != this.applicationsBox)
            this._activeContainer = null;
      } else {
         this.gnoMenuBox.navegateGnoMenuBox(symbol, actor);
         //this._activeContainer = null;
      }
      return true;
   },

   _gnoMenuNavegationKey: function() {
      switch(this.styleGnoMenuPanel.style_class) {
            case 'menu-gno-operative-box-left':
                   return Clutter.KEY_Right;
            case 'menu-gno-operative-box-right':
                   return Clutter.KEY_Left;
            case 'menu-gno-operative-box-top':
                   return Clutter.KEY_Down;
            case 'menu-gno-operative-box-bottom':
                   return Clutter.KEY_Up;
      }
      return Clutter.KEY_Up;
   },

   _gnoMenuNavegationInvertedKey: function() {
      switch(this.styleGnoMenuPanel.style_class) {
            case 'menu-gno-operative-box-left':
                   return Clutter.KEY_Left;
            case 'menu-gno-operative-box-right':
                   return Clutter.KEY_Right;
            case 'menu-gno-operative-box-top':
                   return Clutter.KEY_Up;
            case 'menu-gno-operative-box-bottom':
                   return Clutter.KEY_Down;
      }
      return Clutter.KEY_Left;
   },

   _navegateBttChanger: function(symbol) {
      if(symbol == Clutter.Tab) {
         this.fav_actor = this._changeFocusElement(this.bttChanger.actor);
         Mainloop.idle_add(Lang.bind(this, this._putFocus));
      } else if((symbol == Clutter.Return) || (symbol == Clutter.KEY_Return) || (symbol == Clutter.KP_Enter)) {
         this.bttChanger.activateNext();
      }
      return true;
   },

   _navegateHoverIcon: function(symbol, actor) {
      if(symbol == Clutter.Tab) {
         this.fav_actor = this._changeFocusElement(this.hover.actor);
         Mainloop.idle_add(Lang.bind(this, this._putFocus));
      }
      return true;
   },

   _navegateHoverMenu: function(symbol, actor) {
      if(symbol == Clutter.Tab) {
         this.fav_actor = this._changeFocusElement(this.hover.actor);
         Mainloop.idle_add(Lang.bind(this, this._putFocus));
      } else {
         this.hover.navegateHoverMenu(symbol, actor);
      }
      return true;
   },

   _putFocus: function() {
      global.stage.set_key_focus(this.fav_actor);
   },

   _updateAppPrefNumIcons: function() {
      this.aviableWidth = this.applicationsScrollBox.actor.get_allocation_box().x2-this.applicationsScrollBox.actor.get_allocation_box().x1 - 42;
      if((this.aviableWidth > 0)&&(this._applicationsBoxWidth > 0)) {// + 42
         let newNumber = Math.floor(this.aviableWidth/this._applicationsBoxWidth);
         if(newNumber*this._applicationsBoxWidth > this.aviableWidth)
            newNumber--;
         if(newNumber < 1)
            newNumber = 1;
         if(this.iconViewCount != newNumber) {
            this.iconViewCount = newNumber;
            this.appBoxIter.setNumberView(this.iconViewCount);
            return true;
         }
      }
      return false;
   },

  _updateAppNumColumms: function() {
      let internalCat = this.applicationsBox.get_children();
      let appBox, newViewBox;
      for(let i = 0; i < internalCat.length; i++) {
         if(!(internalCat[i]._delegate instanceof PopupMenu.PopupSeparatorMenuItem)) {
            appBox = internalCat[i].get_children();
            for(let j = appBox.length; j < this.iconViewCount; j++) {
               newViewBox = new St.BoxLayout({ vertical: true, width: (this._applicationsBoxWidth) });
               internalCat[i].add(newViewBox, { x_fill: false, y_fill: true, x_align: St.Align.START, y_align: St.Align.START, expand: true });
            }
            for(let j = this.iconViewCount; j < appBox.length; j++) {
               internalCat[i].remove_actor(appBox[j]);
               appBox[j].destroy();
            }
            for(let j = 0; j < appBox.length; j++) {
                appBox[j].set_width(this._applicationsBoxWidth);
            }
         }  
      }
   },

   _updateAppSize: function() {
      this._applicationsBoxWidth = 0;   
      for(let i = 0; i < this._applicationsButtons.length; i++) {
         if(this._applicationsButtons[i].actor.get_width() > this._applicationsBoxWidth)
            this._applicationsBoxWidth = this._applicationsButtons[i].actor.get_width();
      }
      for(let i = 0; i < this._applicationsButtons.length; i++) {
         this._applicationsButtons[i].container.set_width(this._applicationsBoxWidth);
      }
      for(let i = 0; i < this._placesButtons.length; i++) {
         this._placesButtons[i].container.set_width(this._applicationsBoxWidth);
      }
      for(let i = 0; i < this._recentButtons.length; i++) {
         this._recentButtons[i].container.set_width(this._applicationsBoxWidth);
      }
      for(let i = 0; i < this._transientButtons.length; i++) {
         this._transientButtons[i].container.set_width(this._applicationsBoxWidth);
      }
      for(let i = 0; i < this._searchItems.length; i++) {
         if(this._searchItems[i] instanceof SearchItem)
            this._searchItems[i].container.set_width(this._applicationsBoxWidth);
      }
      this.pkg.updateButtonStatus(this.iconAppSize, this.textButtonWidth, this.appButtonDescription, this.iconView, this._applicationsBoxWidth);
      if(this.theme == "windows7") {
         this.searchEntry.set_width(this._applicationsBoxWidth + 42);
      }
   },

   _clearAppSize: function() {
      this._applicationsBoxWidth = 0;
      for(let i = 0; i < this._applicationsButtons.length; i++) {
          this._applicationsButtons[i].container.set_width(-1);
      } 
      for(let i = 0; i < this._placesButtons.length; i++) {
         this._placesButtons[i].container.set_width(-1);
      }
      for(let i = 0; i < this._recentButtons.length; i++) {
         this._recentButtons[i].container.set_width(-1);
      }
      for(let i = 0; i < this._transientButtons.length; i++) {
         this._transientButtons[i].container.set_width(-1);
      }
      for(let i = 0; i < this._searchItems.length; i++) {
         if(this._searchItems[i] instanceof SearchItem)
            this._searchItems[i].container.set_width(-1);
      }
      this.pkg.updateButtonStatus(this.iconAppSize, this.textButtonWidth, this.appButtonDescription, this.iconView, -1);
   },

   _updateAppButtonDesc: function() {  
      for(let i = 0; i < this._applicationsButtons.length; i++) {
         this._applicationsButtons[i].setAppDescriptionVisible(this.appButtonDescription);
      }
      for(let i = 0; i < this._placesButtons.length; i++) {
         this._placesButtons[i].setAppDescriptionVisible(this.appButtonDescription);
      }
      for(let i = 0; i < this._recentButtons.length; i++) {
         this._recentButtons[i].setAppDescriptionVisible(this.appButtonDescription);
      }
      for(let i = 0; i < this._transientButtons.length; i++) {
         this._transientButtons[i].setAppDescriptionVisible(this.appButtonDescription);
      }
      for(let i = 0; i < this._searchItems.length; i++) {
         if(this._searchItems[i] instanceof SearchItem)
            this._searchItems[i].setAppDescriptionVisible(this.appButtonDescription);
      }
      this.pkg.updateButtonStatus(this.iconAppSize, this.textButtonWidth, this.appButtonDescription, this.iconView, this._applicationsBoxWidth);
   },

   _updateTextButtonWidth: function() {
      for(let i = 0; i < this._applicationsButtons.length; i++) {
         this._applicationsButtons[i].setTextMaxWidth(this.textButtonWidth);
      }
      for(let i = 0; i < this._placesButtons.length; i++) {
         this._placesButtons[i].setTextMaxWidth(this.textButtonWidth);
      }
      for(let i = 0; i < this._recentButtons.length; i++) {
         this._recentButtons[i].setTextMaxWidth(this.textButtonWidth);
      }
      for(let i = 0; i < this._transientButtons.length; i++) {
         this._transientButtons[i].setTextMaxWidth(this.textButtonWidth);
      }
      for(let i = 0; i < this._searchItems.length; i++) {
         if(this._searchItems[i] instanceof SearchItem)
            this._searchItems[i].setTextMaxWidth(this.textButtonWidth);
      }
      this.pkg.updateButtonStatus(this.iconAppSize, this.textButtonWidth, this.appButtonDescription, this.iconView, this._applicationsBoxWidth);
   },

   _setAppIconDirection: function() {
      for(let i = 0; i < this._applicationsButtons.length; i++) {
         this._applicationsButtons[i].setVertical(this.iconView);
      }
      for(let i = 0; i < this._placesButtons.length; i++) {
         this._placesButtons[i].setVertical(this.iconView);
      }
      for(let i = 0; i < this._recentButtons.length; i++) {
         this._recentButtons[i].setVertical(this.iconView);
      }
      for(let i = 0; i < this._transientButtons.length; i++) {
         this._transientButtons[i].setVertical(this.iconView);
      }
      for(let i = 0; i < this._searchItems.length; i++) {
         if(this._searchItems[i] instanceof SearchItem)
            this._searchItems[i].setVertical(this.iconView);
      }
      this.pkg.updateButtonStatus(this.iconAppSize, this.textButtonWidth, this.appButtonDescription, this.iconView, this._applicationsBoxWidth);
   },

   _updateView: function() {
      this._clearView();
      this._updateAppPrefNumIcons();
      this._updateAppNumColumms();
      try {
         this.pkg.updateView();
         let currValue, falseActor;
         let viewBox = this.standarAppBox.get_children();
         for(let i = 0; i < this.visibleAppButtons.length; i += viewBox.length) {
            currValue = i;
            for(let j = 0; j < viewBox.length; j++) {
               if(currValue < this.visibleAppButtons.length) {
                  viewBox[j].add_actor(this.visibleAppButtons[currValue].actor);
                  if(this.visibleAppButtons[currValue].menu)
                     viewBox[j].add_actor(this.visibleAppButtons[currValue].menu.actor);
                  else {//Remplace menu actor by a hide false actor.
                     falseActor = new St.BoxLayout();
                     falseActor.hide();
                     viewBox[j].add_actor(falseActor);
                  }
               }
               currValue++;
            }
         }
         if(this.visibleSearchButtons) {
            viewBox = this.searchAppBox.get_children();
            for(let i = 0; i < this.visibleSearchButtons.length; i += viewBox.length) {
               currValue = i;
               for(let j = 0; j < viewBox.length; j++) {
                  if(currValue < this.visibleSearchButtons.length) {
                     viewBox[j].add_actor(this.visibleSearchButtons[currValue].actor);   
                     if(this.visibleSearchButtons[currValue].menu)
                        viewBox[j].add_actor(this.visibleSearchButtons[currValue].menu.actor);
                     else {//Remplace menu actor by a hide false actor.
                        falseActor = new St.BoxLayout();
                        falseActor.hide();
                        viewBox[j].add_actor(falseActor);
                     }
                  }
                  currValue++;
               }
            }
         }
      } catch(e) {
        Main.notify("Error10", e.message);
      }
   },

   _clearView: function() {
      if(this.enablePackageSearch)
          this.pkg.clearView();
      let appBox = this.standarAppBox.get_children();
      let appItem;
      for(let i = 0; i < appBox.length; i++) {
         appItem = appBox[i].get_children();
         for(let j = 0; j < appItem.length; j++) {
            appBox[i].remove_actor(appItem[j]);
         }
         if(i > 0)
            appBox[i].set_width(-1);
      }
      appBox = this.searchAppBox.get_children();
      for(let i = 0; i < appBox.length; i++) {
         appItem = appBox[i].get_children();
         for(let j = 0; j < appItem.length; j++) {
            appBox[i].remove_actor(appItem[j]);
         }
         if(i > 0)
            appBox[i].set_width(-1);
      }
   },

   _updateVFade: function() { 
      let mag_on = this.a11y_settings.get_boolean("screen-magnifier-enabled");
      if(mag_on) {
         this.applicationsScrollBox.set_style_class("menu-applications-scrollbox");
      } else {
         this.applicationsScrollBox.set_style_class("vfade menu-applications-scrollbox");
      }
   },

   _update_autoscroll: function() {
      this._set_autoscroll(this.autoscroll_enabled);
   },

   _set_autoscroll: function(enabled) {
      this.applicationsScrollBox.setAutoScrolling(enabled);
      this.categoriesScrollBox.setAutoScrolling(enabled);
      this.favoritesScrollBox.setAutoScrolling(enabled);
      if(this.accessibleBox)
         this.accessibleBox.setAutoScrolling(enabled);
      if(this.gnoMenuBox)
         this.gnoMenuBox.setAutoScrolling(enabled);
   },

   _restartAutoscroll: function() {
      if(this.autoscroll_enabled) {
         this._set_autoscroll(false);
         this._set_autoscroll(true);
      }
   },

   _updateSeparators: function() {
      if(this.separatorTop.actor.get_parent() != null) {
         this.separatorTop.separatorLine.actor.connect('style_changed', Lang.bind(this, function() {
            Mainloop.idle_add(Lang.bind(this, function() {
               if(this.menu.isOpen) {
                  let sourceNode = this.separatorTop.separatorLine.actor.get_theme_node();
                  this.separatorTop.actor.visible = (sourceNode.get_length('-remove-separator') == 0);
               }
            }));
         }));
      }
      if(this.separatorMiddle.actor.get_parent() != null) {
         this.separatorMiddle.separatorLine.actor.connect('style_changed', Lang.bind(this, function() {
            Mainloop.idle_add(Lang.bind(this, function() {
               if(this.menu.isOpen) {
                  let sourceNode = this.separatorMiddle.separatorLine.actor.get_theme_node();
                  this.separatorMiddle.actor.visible = (sourceNode.get_length('-remove-separator') == 0);
               }
            }));  
         }));
      }
      if(this.separatorBottom.actor.get_parent() != null) {
         this.separatorBottom.separatorLine.actor.connect('style_changed', Lang.bind(this, function() {
            Mainloop.idle_add(Lang.bind(this, function() {
               if(this.menu.isOpen) {
                  let sourceNode = this.separatorBottom.separatorLine.actor.get_theme_node();
                  this.separatorBottom.actor.visible = (sourceNode.get_length('-remove-separator') == 0);
               }
            }));
         }));
      }
   },

   _onCategoriesOpenChange: function() {
      this._refreshApps();
      this._updateAppButtonDesc();
      this._updateTextButtonWidth();
      this._setAppIconDirection();
      this._updateAppSize();
      this._updateSize();
   },

   _setIconMaxFavSize: function() {
      this._refreshFavs();
      this._updateSize();
   },

   _setIconControlSize: function() {
      if(this.controlView) {
         this.controlView.setIconSize(this.iconControlSize);
         this._updateSize();
      }
   },

   _setVisibleHoverIconBox: function() {
      if(this.hover) {
         this.hover.setSpecialColor(this.showHoverIconBox);
         this._updateSize();
      }
   },

   _setVisibleControlBox: function() {
      if(this.controlView) {
         this.controlView.setSpecialColor(this.showControlBox);
         this._updateSize();
      }
   },

   _setVisiblePowerBox: function() {
      if(this.powerBox) {
         this.powerBox.setSpecialColor(this.showPowerBox);
         this._updateSize();
      }
   },

   _setVisibleAccessibleBox: function() {
      if(this.accessibleBox) {
         this.accessibleBox.setSpecialColor(this.showAccessibleBox);
         this._updateSize();
      }
   },

   _setVisibleGnoMenuBox: function() {
      if(this.gnoMenuBox) {
         this.gnoMenuBox.setSpecialColor(this.showGnoMenuBox);
         this._updateSize();
      }
   },

   _setVisibleRemovable: function() {
      if(this.accessibleBox) {
         this.accessibleBox.showRemovableDrives(this.showRemovable);
         this._updateSize();
      }
   },

   _setVisibleAccessibleIcons: function() {
      if(this.accessibleBox) {
         this.accessibleBox.setIconsVisible(this.showAccessibleIcons);
         this._updateSize();
      }
   },

   _setVisibleCategoriesIcons: function() {
      this._setCategoriesIconsVisible(this.showCategoriesIcons);
      this._updateSize();
   },

   _setIconPowerSize: function() {
      if(this.powerBox) {
         this.powerBox.setIconSize(this.iconPowerSize);
         this._updateSize();
      }
   },

   _setIconHoverSize: function() {
      if(this.hover) {
         this.hover.setIconSize(this.iconHoverSize);
         this._updateSize();
      }
   },

   _setIconAccessibleSize: function() {
      if(this.accessibleBox) {
         this.accessibleBox.setIconSize(this.iconAccessibleSize);   
      }
      this._updateSize();
   },

   _setIconGnoMenuSize: function() {
      if(this.gnoMenuBox) {
         this.gnoMenuBox.setIconSize(this.iconGnoMenuSize);
      }
      this._updateSize();
   },

   _setVisibleViewControl: function() {
      if(this.controlView) {
         this.controlView.actor.visible = this.showView;
         if(this.accessibleBox)
            this.accessibleBox.updateVisibility();
         this._updateSize();
      }
   },

   _setControlButtonsSymbolic: function() {
      if(this.controlView) {
         this.controlView.setIconSymbolic(this.controlSymbolic);
      }
   },

   _setPowerButtonsSymbolic: function() {
      if(this.powerBox) {
         this.powerBox.setIconSymbolic(this.powerSymbolic);
      }
   },

   _onEffectChange: function() {
      this.menu.setEffect(this.effect);
   },

   _onEffectTimeChange: function() {
      this.menu.setEffectTime(this.effectTime);
   },

   _onSwapPanel: function() {
      try {
         if((this.bottomBoxSwaper)&&(this.topBoxSwaper)) {
            let parent = this.topBoxSwaper.get_parent();
            if(parent) parent.remove_actor(this.topBoxSwaper);
            parent = this.bottomBoxSwaper.get_parent();
            if(parent) parent.remove_actor(this.bottomBoxSwaper);

            parent = this.changeTopBoxUp.get_parent();
            if(parent) parent.remove_actor(this.changeTopBoxUp);
            parent = this.changeTopBoxDown.get_parent();
            if(parent) parent.remove_actor(this.changeTopBoxDown);
            parent = this.changeBottomBoxUp.get_parent();
            if(parent) parent.remove_actor(this.changeBottomBoxUp);
            parent = this.changeBottomBoxDown.get_parent();
            if(parent) parent.remove_actor(this.changeBottomBoxDown);

            if(this.swapPanels) {
               this.topBoxSwaper.set_style_class_name('menu-top-box-swap-' + this.theme);
               this.bottomBoxSwaper.set_style_class_name('menu-bottom-box-swap-' + this.theme);
               this.beginBox.add_actor(this.bottomBoxSwaper);
               this.endBox.add_actor(this.topBoxSwaper);
               this.changeTopBox.add_actor(this.changeTopBoxDown);
               this.changeTopBox.add_actor(this.changeTopBoxUp);
               this.changeBottomBox.add_actor(this.changeBottomBoxDown);
               this.changeBottomBox.add_actor(this.changeBottomBoxUp);
            }
            else {
               this.topBoxSwaper.set_style_class_name('menu-top-box-' + this.theme);
               this.bottomBoxSwaper.set_style_class_name('menu-bottom-box-' + this.theme);
               this.beginBox.add_actor(this.topBoxSwaper);
               this.endBox.add_actor(this.bottomBoxSwaper);
               this.changeTopBox.add_actor(this.changeTopBoxUp);
               this.changeTopBox.add_actor(this.changeTopBoxDown);
               this.changeBottomBox.add_actor(this.changeBottomBoxUp);
               this.changeBottomBox.add_actor(this.changeBottomBoxDown);
            }
         }
      } catch(e) {
         Main.notify("errorTheme", e.message);
      }
   },

   _setSearhEntryVisible: function() {
      if(this.menu.isOpen)
         this.menu.close();
      this.searchEntry.visible = this.showSearhEntry;
      this.searchBox.visible = this.showSearhEntry;
      if(this.theme == "mint")
         this.searchName.visible = this.showSearhEntry;
   },

   _changeView: function() {
      try {
      if(this.controlView) {
         this.controlView.changeViewSelected(this.iconView);
         this._clearAppSize();
         this._updateAppButtonDesc();
         this._updateTextButtonWidth();
         this._setAppIconDirection();
         this._updateAppSize();
         this._refreshFavs();
         this._updateSize();     
      }
      } catch(e) {
         Main.notify("Erp" + e.message);
      }
   },

   _setVisibleFavorites: function() {
      if(this.appletMenu) {
         this.appMenuClose();
         this.appletMenu.getActorForName("Favorites").visible = this.showFavorites;
      }
      if(this.gnoMenuBox)
         this.gnoMenuBox.showFavorites(this.showFavorites);
      this.favoritesScrollBox.actor.visible = this.showFavorites;
      this.favBoxWrapper.visible = this.showFavorites;
      this._refreshFavs();
      this._updateSize();
   },

   _setVisiblePowerButtons: function() {
      this.powerBox.actor.visible = this.showPowerButtons;
      this._updateSize();
   },

   _setVisibleHoverIcon: function() {
      this.hover.actor.visible = this.showHoverIcon;
      this.hover.container.visible = this.showHoverIcon;
      if(this.accessibleBox)
         this.accessibleBox.updateVisibility();
      if(this.hover.menu.actor.visible)
         this.hover.menu.actor.visible = this.showHoverIcon;
      this._updateSize();
   },

   _setVisibleTimeDate: function() {
      if(this.selectedAppBox)
         this.selectedAppBox.setDateTimeVisible(this.showTimeDate);
   },

   _setVisibleScrollFav: function() {
      if(this.favoritesScrollBox) {
         this.favoritesScrollBox.setScrollVisible(this.scrollFavoritesVisible);
      }
   },

   _setVisibleScrollCat: function() {
      if(this.categoriesScrollBox) {
         this.categoriesScrollBox.setScrollVisible(this.scrollCategoriesVisible);
      }
   },

   _setVisibleScrollApp: function() {
      if(this.applicationsScrollBox) {
         this.applicationsScrollBox.setScrollVisible(this.scrollApplicationsVisible);
      }
   },

   _setVisibleScrollAccess: function() {
      if(this.accessibleBox) {
         this.accessibleBox.setScrollVisible(this.scrollAccessibleVisible);
      }
   },

   _setVisibleScrollGnoMenu: function() {
      if(this.gnoMenuBox) {
         this.gnoMenuBox.setScrollVisible(this.scrollGnoMenuVisible);
      }
   },

   _setVisibleArrowCat: function() {
      for(let i = 0; i < this._categoryButtons.length; i++) {
         this._setCategoryArrow(this._categoryButtons[i]);
      }
      this._setCategoryArrow(this.placesButton);
      this._setCategoryArrow(this.recentButton);
   },

   _setCategoryArrow: function(category) {
      if(category) {
         if(this.categoriesBox.get_vertical()) {
           if(this.theme == "whisker")
              category.setArrow(this.arrowCategoriesVisible, !this.arrowCategoriesSelected, St.Side.LEFT);
           else if((this.theme == "classicGnome")||(this.theme == "kicker")) {
              if(this.popupOrientation == St.Side.LEFT)
                 category.setArrow(this.arrowCategoriesVisible, !this.arrowCategoriesSelected, St.Side.RIGHT);
              else
                 category.setArrow(this.arrowCategoriesVisible, !this.arrowCategoriesSelected, St.Side.LEFT);
           } else
              category.setArrow(this.arrowCategoriesVisible, !this.arrowCategoriesSelected, St.Side.RIGHT)
         }
         category.setArrowVisible((this.arrowCategoriesVisible)&&(!this.arrowCategoriesSelected));
      }
   },

   _setVisibleSeparatorLine: function() {
      this.powerBox.setSeparatorLine(this.showSeparatorLine);
      if(this.accessibleBox)
         this.accessibleBox.setSeparatorLine(this.showSeparatorLine);
      if(this.separatorMiddle)
         this.separatorMiddle.setLineVisible(this.showSeparatorLine);
      if(this.separatorTop)
         this.separatorTop.setLineVisible(this.showSeparatorLine);
      if(this.separatorBottom)
         this.separatorBottom.setLineVisible(this.showSeparatorLine);
      this._updateSize();
   },

   _updateSeparatorSize: function() {
      this.powerBox.setSeparatorSpace(this.separatorSize);
      if(this.accessibleBox)
         this.accessibleBox.setSeparatorSpace(this.separatorSize);
      if(this.separatorMiddle)
         this.separatorMiddle.setSpace(this.separatorSize);
      if(this.separatorTop)
         this.separatorTop.setSpace(this.separatorSize);
      if(this.separatorBottom)
         this.separatorBottom.setSpace(this.separatorSize);
      this._updateSize();
   },

   _setVisibleBoxPointer: function() {
      this._setVisiblePointer(this.showBoxPointer);
   },

   _setVisiblePointer: function(visible) {
      this.menu.showBoxPointer(visible);
      if(this.appMenu) {
         this.appMenu.showBoxPointer(visible);
      }
   },

   _setFixMenuCorner: function() {
      this.menu.fixToCorner(this.fixMenuCorner);
      if(this.appMenu) {
         this.appMenu.fixToCorner(this.fixMenuCorner);
      }
   },

   _setCategoriesIconsVisible: function() {
      for(let i = 0; i < this._categoryButtons.length; i++)
         this._categoryButtons[i].setIconVisible(this.showCategoriesIcons);
   },

   _updateAppSelectedText: function() {
      this.selectedAppBox.setTitleVisible(this.showAppTitle);
      this.selectedAppBox.setDescriptionVisible(this.showAppDescription);
      this.selectedAppBox.setTitleSize(this.appTitleSize);
      this.selectedAppBox.setDescriptionSize(this.appDescriptionSize);
      this._updateSize();
   },

   _updateTimeDateFormat: function() {
      this.selectedAppBox.setDateFormat(this.dateFormat);
      this.selectedAppBox.setTimeFormat(this.timeFormat);
   },

   _onThemeChange: function() {
      this._updateComplete();
      this._updateSize();
   },

   _onSelectedThemeChange: function() {
      if(this._timeOutSettings == 0)
         this._timeOutSettings = Mainloop.timeout_add(1500, Lang.bind(this, this._updateSelectedTheme));
   },

   _updateSelectedTheme: function() {
      if(this._timeOutSettings > 0) {
         Mainloop.source_remove(this._timeOutSettings);
         this._timeOutSettings = 0;
         try {
            this._loadConfigTheme();
            this._onThemeChange();
         } catch(e) {
            Main.notify("errorTheme", e.message);
         }
      }
   },

   _loadConfigTheme: function() {
      let confTheme = this.getThemeConfig(this.themes[this.theme]);
      this.powerTheme = confTheme["power-theme"];
      this.gnoMenuButtonsTheme = confTheme["gnomenu-buttons-theme"];
      this.showRecent = confTheme["show-recent"];
      this.showPlaces = confTheme["show-places"];
      this.activateOnHover = confTheme["activate-on-hover"];
      this.menuIcon = confTheme["menu-icon"];
      this.menuLabel = confTheme["menu-label"];
      this.showSearhEntry = confTheme["allow-search"];
      //this.searchSorted = confTheme["search-sorted"];
      //this.searchFilesystem = confTheme["search-filesystem"];
      this.swapPanels = confTheme["swap-panels"];
      this.categoriesHover = confTheme["categories-hover"];
      this.hover_delay_ms = confTheme["hover-delay"];
      this.autoscroll_enabled = confTheme["enable-autoscroll"];
      this.showView = confTheme["show-view-item"];
      this.controlSymbolic = confTheme["control-symbolic"];
      this.powerSymbolic = confTheme["power-symbolic"];
      this.iconView = confTheme["view-item"];
      this.activateOnPress = confTheme["activate-on-press"];
      this.showHoverIconBox = confTheme["hover-box"];
      this.showControlBox = confTheme["control-box"];
      this.showPowerBox = confTheme["power-box"];
      this.showAccessibleBox = confTheme["accessible-box"];
      this.showGnoMenuBox = confTheme["gnomenu-box"];
      this.showRemovable = confTheme["show-removable-drives"];
      this.showAccessibleIcons = confTheme["accessible-icons"];
      this.showCategoriesIcons = confTheme["categories-icons"];
      this.textButtonWidth = confTheme["app-button-width"];
      this.appButtonDescription = confTheme["app-description"];
      this.iconAppSize = confTheme["icon-app-size"];
      this.iconCatSize = confTheme["icon-cat-size"];
      this.iconMaxFavSize = confTheme["icon-max-fav-size"];
      this.iconPowerSize = confTheme["icon-power-size"];
      this.iconControlSize = confTheme["icon-control-size"];
      this.iconHoverSize = confTheme["icon-hover-size"];
      this.iconAccessibleSize = confTheme["icon-accessible-size"];
      this.iconGnoMenuSize = confTheme["icon-gnomenu-size"];
      this.showFavorites = confTheme["show-favorites"];
      this.favoritesLinesNumber = confTheme["favorites-lines"];
      this.showHoverIcon = confTheme["show-hover-icon"];
      this.showPowerButtons = confTheme["show-power-buttons"];
      this.showTimeDate = confTheme["show-time-date"];
      this.timeFormat = confTheme["time-format"];
      this.dateFormat = confTheme["date-format"];
      this.showAppTitle = confTheme["show-app-title"];
      this.appTitleSize = confTheme["app-title-size"];
      this.showAppDescription = confTheme["show-app-description"];
      this.appDescriptionSize = confTheme["app-description-size"];
      this.automaticSize = confTheme["automatic-size"];
      this.controlingSize = confTheme["allow-resizing"];
      this.fullScreen = confTheme["full-screen"];
      this.width = confTheme["width"];
      this.height = confTheme["height"];
      this.scrollFavoritesVisible = confTheme["scroll-favorites"];
      this.scrollCategoriesVisible = confTheme["scroll-categories"];
      this.arrowCategoriesVisible = confTheme["arrow-categories"];
      this.arrowCategoriesSelected = confTheme["arrow-categories-selected"];
      this.scrollApplicationsVisible = confTheme["scroll-applications"];
      this.scrollAccessibleVisible = confTheme["scroll-accessible"];
      this.scrollGnoMenuVisible = confTheme["scroll-gnomenu"];
      this.showSeparatorLine = confTheme["spacer-line"];
      this.separatorSize = confTheme["spacer-size"];
      this.showBoxPointer = confTheme["show-box-pointer"];
      this.fixMenuCorner = confTheme["fix-menu-corner"];
   },

   _saveConfigTheme: function() {
      let confTheme = new Array();
      confTheme["power-theme"] = this.powerTheme;
      confTheme["gnomenu-buttons-theme"] = this.gnoMenuButtonsTheme;

      confTheme["show-recent"] = this.showRecent;
      confTheme["show-places"] = this.showPlaces;
      confTheme["activate-on-hover"] = this.activateOnHover;
      confTheme["menu-icon"] = this.menuIcon;
      confTheme["menu-label"] = this.menuLabel;
      confTheme["allow-search"] = this.showSearhEntry;
      //confTheme["search-sorted"] = this.searchSorted;
      //confTheme["search-filesystem"] = this.searchFilesystem;
      confTheme["swap-panels"] = this.swapPanels;
      confTheme["categories-hover"] = this.categoriesHover;
      confTheme["hover-delay"] = this.hover_delay_ms;
      confTheme["enable-autoscroll"] = this.autoscroll_enabled;

      confTheme["show-view-item"] = this.showView;
      confTheme["control-symbolic"] = this.controlSymbolic;
      confTheme["power-symbolic"] = this.powerSymbolic;
      confTheme["view-item"] = this.iconView;
      confTheme["activate-on-press"] = this.activateOnPress;
      confTheme["hover-box"] = this.showHoverIconBox;
      confTheme["control-box"] = this.showControlBox;
      confTheme["power-box"] = this.showPowerBox;
      confTheme["accessible-box"] = this.showAccessibleBox;
      confTheme["gnomenu-box"] = this.showGnoMenuBox;
      confTheme["show-removable-drives"] = this.showRemovable;
      confTheme["accessible-icons"] = this.showAccessibleIcons;
      confTheme["categories-icons"] = this.showCategoriesIcons;
      confTheme["app-button-width"] = this.textButtonWidth;
      confTheme["app-description"] = this.appButtonDescription;
      confTheme["icon-app-size"] = this.iconAppSize;
      confTheme["icon-cat-size"] = this.iconCatSize;
      confTheme["icon-max-fav-size"] = this.iconMaxFavSize;
      confTheme["icon-power-size"] = this.iconPowerSize;
      confTheme["icon-control-size"] = this.iconControlSize;
      confTheme["icon-hover-size"] = this.iconHoverSize;
      confTheme["icon-accessible-size"] = this.iconAccessibleSize;
      confTheme["icon-gnomenu-size"] = this.iconGnoMenuSize;
      confTheme["show-favorites"] = this.showFavorites;
      confTheme["favorites-lines"] = this.favoritesLinesNumber;
      confTheme["show-hover-icon"] = this.showHoverIcon;
      confTheme["show-power-buttons"] = this.showPowerButtons;
      confTheme["show-time-date"] = this.showTimeDate;
      confTheme["time-format"] = this.timeFormat;
      confTheme["date-format"] = this.dateFormat;
      confTheme["show-app-title"] = this.showAppTitle;
      confTheme["app-title-size"] = this.appTitleSize;
      confTheme["show-app-description"] = this.showAppDescription;
      confTheme["app-description-size"] = this.appDescriptionSize;
      confTheme["automatic-size"] = this.automaticSize;
      confTheme["allow-resizing"] = this.controlingSize;
      confTheme["full-screen"] = this.fullScreen;
      confTheme["width"] = this.width;
      confTheme["height"] = this.height;
      confTheme["scroll-favorites"] = this.scrollFavoritesVisible;
      confTheme["scroll-categories"] = this.scrollCategoriesVisible;
      confTheme["arrow-categories"] = this.arrowCategoriesVisible;
      confTheme["arrow-categories-selected"] = this.arrowCategoriesSelected;
      confTheme["scroll-applications"] = this.scrollApplicationsVisible;
      confTheme["scroll-accessible"] = this.scrollAccessibleVisible;
      confTheme["scroll-gnomenu"] = this.scrollGnoMenuVisible;
      confTheme["spacer-line"] = this.showSeparatorLine;
      confTheme["spacer-size"] = this.separatorSize;
      confTheme["show-box-pointer"] = this.showBoxPointer;
      confTheme["fix-menu-corner"] = this.fixMenuCorner;
      this.setThemeConfig(this.theme, confTheme);
   },

   _onThemePowerChange: function() {
      if(this.powerBox)
         this.powerBox.setTheme(this.powerTheme);
      this._updateSize();
   },

   _onThemeGnoMenuButtonsChange: function() {
      if(this.gnoMenuBox)
         this.gnoMenuBox.setTheme(this.gnoMenuButtonsTheme);
      this._updateSize();
   },

   _updateComplete: function() {
      if(this.appMenu)
         this._appletGenerateGnomeMenu(false);
      if(this.accessibleBox) {
         this.accessibleBox.destroy();
         this.accessibleBox = null;
      }
      if(this.gnoMenuBox) {
         this.gnoMenuBox.destroy();
         this.gnoMenuBox = null;
      }
      if(this.bttChanger)
         this.bttChanger.destroy();

      this._display();
      this._setVisibleBoxPointer();
      this._setFixMenuCorner();
      this._onSwapPanel();
      this._onEffectChange();
      this._onEffectTimeChange();
      this._setVisibleTimeDate();
      this._setVisibleScrollFav();
      this._setVisibleScrollCat();
      this._setVisibleScrollApp();
      this._setVisibleScrollAccess();
      this._setVisibleScrollGnoMenu();
      this._setVisibleArrowCat();

      this.menu.actor.set_width(this.width);
      this.mainBox.set_height(this.height);
      if(this.appMenu) {
         if(!this.automaticSize) {
            this.appMenu.actor.set_width(this.subMenuWidth);
            this.appMenu.actor.set_height(this.subMenuHeight);
         }
      }

      if(this.separatorMiddle) {
         this.separatorMiddle.setLineVisible(this.showSeparatorLine);
         this.separatorMiddle.setSpace(this.separatorSize);
      }
      if(this.separatorTop) {
         this.separatorTop.setLineVisible(this.showSeparatorLine);
         this.separatorTop.setSpace(this.separatorSize);
      }
      if(this.separatorBottom) {
         this.separatorBottom.setLineVisible(this.showSeparatorLine);
         this.separatorBottom.setSpace(this.separatorSize);
      }
      if(this.appletMenu) {
         this.appletMenu.getActorForName("Favorites").visible = this.showFavorites;
      }

      this.favoritesScrollBox.actor.visible = this.showFavorites;
      this.favBoxWrapper.visible = this.showFavorites;
      this.selectedAppBox.setTitleVisible(this.showAppTitle);
      this.selectedAppBox.setDescriptionVisible(this.showAppDescription);
      this.selectedAppBox.setTitleSize(this.appTitleSize);
      this.selectedAppBox.setDescriptionSize(this.appDescriptionSize);
      this._setCategoriesIconsVisible(this.showCategoriesIcons);

      this._updateTimeDateFormat();
      this._update_autoscroll();
      this._updateActivateOnHover();
      this._updateIconAndLabel();
      this._update_hover_delay();
      this._setSearhEntryVisible();

      if(this.hover) {
         this.hover.actor.visible = this.showHoverIcon;
         this.hover.container.visible = this.showHoverIcon;
         if(this.hover.menu.actor.visible)
            this.hover.menu.actor.visible = this.showHoverIcon;
         this.hover.setIconSize(this.iconHoverSize);
         this.hover.setSpecialColor(this.showHoverIconBox);
      }
      if(this.gnoMenuBox) {
         this.gnoMenuBox.showFavorites(this.showFavorites);
         this.gnoMenuBox.setIconSize(this.iconGnoMenuSize);
         this.gnoMenuBox.setTheme(this.gnoMenuButtonsTheme);
         this.gnoMenuBox.setSpecialColor(this.showGnoMenuBox);
      }
      if(this.controlView) {
         this.controlView.actor.visible = this.showView;
         this.controlView.setIconSize(this.iconControlSize);
         this.controlView.setSpecialColor(this.showControlBox);
         this.controlView.changeViewSelected(this.iconView);
         this.controlView.setIconSymbolic(this.controlSymbolic);
      }
      if(this.powerBox) {
         this.powerBox.setSeparatorLine(this.showSeparatorLine);
         this.powerBox.setSeparatorSpace(this.separatorSize);
         this.powerBox.setIconSize(this.iconPowerSize);
         this.powerBox.actor.visible = this.showPowerButtons;
         this.powerBox.setTheme(this.powerTheme);
         this.powerBox.setSpecialColor(this.showPowerBox);
         this.powerBox.setIconSymbolic(this.powerSymbolic);
      }
      if(this.accessibleBox) {
         this.accessibleBox.setSeparatorLine(this.showSeparatorLine);
         this.accessibleBox.setSeparatorSpace(this.separatorSize);
         this.accessibleBox.setIconSize(this.iconAccessibleSize);
         this.accessibleBox.setSpecialColor(this.showAccessibleBox);
         this.accessibleBox.showRemovableDrives(this.showRemovable);
         this.accessibleBox.setIconsVisible(this.showAccessibleIcons);
         this.accessibleBox.updateVisibility();
      }

      this._clearAppSize();
      this._updateAppButtonDesc();
      this._updateTextButtonWidth();
      this._setAppIconDirection();
      this._updateAppSize();
      this._refreshFavs();
      this._updateView();
      this._select_category(null, this._allAppsCategoryButton);
      this._alignSubMenu();
      this._appletHoverFixed();

      Mainloop.idle_add(Lang.bind(this, function() {
         this._validateMenuSize();
         this._findOrientation();
         this._openOutScreen();
      //   this._clearAllSelections(true);
      //   this._clearCategories();
      }));
   },

  _openOutScreen: function() {
      this.menu.actor.x = -10000;
      this.menu.openClean();
      if(this.appMenu) {
         this.appMenu.actor.x = -10000;//the menu blinding...
         this.appMenu.open();
      }
      Mainloop.idle_add(Lang.bind(this, function() {
         if(this.bttChanger)
           this.bttChanger.activateSelected(_("Favorites"));
         if(this.gnoMenuBox)
            this.gnoMenuBox.setSelected(_("All Applications"));
         Mainloop.idle_add(Lang.bind(this, function() {
            this.menu.closeClean();
            this.menu.actor.x = 0;
            if(this.appMenu)
               this.appMenu.actor.x = 0;
         }));
      }));
   },


   _appletHoverFixed: function() { //This is for error in cinnamon standar theme only and it's fixed
      if(!this.appletMenu) {
         if(this.idAppletEnter == 0)
            this.idAppletEnter = this.actor.connect('enter-event', Lang.bind(this, this._changeHover, true));
         if(this.idAppletLeave == 0)
               this.idAppletLeave = this.actor.connect('leave-event', Lang.bind(this, this._changeHover, false));
      } else {
         if(this.idAppletEnter > 0) {
            this.actor.disconnect(this.idAppletEnter);
            this.idAppletEnter = 0;
         }
         if(this.idAppletLeave > 0) {
            this.actor.disconnect(this.idAppletLeave);
            this.idAppletLeave = 0;
         }
      }
   },

   _validateMenuSize: function() {
     if(this.fullScreen) {
         this.displayed = true;
         this._setFullScreen(this.fullScreen);
         this.displayed = false;
      } else {
         let monitor = Main.layoutManager.findMonitorForActor(this.actor);
         let maxHeigth = monitor.height - this._processPanelSize(true) - this._processPanelSize(false);
         if(this.height > maxHeigth)
            this.height = maxHeigth;
         if(this.width > monitor.width)
            this.width = monitor.width;
         if(this.controlingSize) {
            this.displayed = true;
            this._activeResize();
            this.displayed = false;
         } else {
            let minWidth = this._minimalWidth();
            if(this.width < minWidth) {
               this.displayed = true;
               this._updateSize();
               this.displayed = false;
            }
         }
      }
   },

   openMenu: function() {
      this.menu.open(false);
   },

   _updateActivateOnHover: function() {
      if(this._openMenuId) {
         this.actor.disconnect(this._openMenuId);
         this._openMenuId = 0;
      }
      if(this.activateOnHover) {
         this._openMenuId = this.actor.connect('enter-event', Lang.bind(this, this.openMenu));
      }
   },

   _update_hover_delay: function() {
      this.hover_delay = this.hover_delay_ms / 1000
   },

   _recalc_height: function() {
      let scrollBoxHeight = (this.leftBox.get_allocation_box().y2-this.leftBox.get_allocation_box().y1) -
                            (this.searchBox.get_allocation_box().y2-this.searchBox.get_allocation_box().y1);
      this.applicationsScrollBox.style = "height: "+scrollBoxHeight / global.ui_scale +"px;";
   },

   _launch_editor: function() {
      Util.spawnCommandLine("cinnamon-menu-editor");
   },

   _activeResize: function() {
      if(this.controlView)
         this.controlView.changeResizeActive(this.controlingSize);
      this.fullScreen = false;
      this.automaticSize = false;
      this._setFullScreen();
   },

   _setAutomaticSize: function() {
      if(this.controlView)
         this.controlView.changeResizeActive(false); 
      this._updateSize();
   },

   _setFullScreen: function() {
     if(this.appMenu) {
         this.appMenuClose();
         if(this.fullScreen)
            this.appMenu.fixToScreen(this.fullScreen);
         else
            this.appMenu.fixToScreen(this.subMenuAlign);
      }
      if(this.controlView)
         this.controlView.changeFullScreen(this.fullScreen);
      if(this.fullScreen) {
         if(this.controlView)
            this.controlView.changeResizeActive(false);
         this._setVisiblePointer(false);
         this.menu.fixToScreen(true);
      } else {
         this.menu.actor.set_width(this.width);
         this.mainBox.set_height(this.height);
         this._setVisiblePointer(this.showBoxPointer);
         this.menu.fixToCorner(this.fixMenuCorner);
         if(this.appletMenu)
            this.onCategorieGnomeChange(this.appletMenu.getActorForName("Main"));
      }

      this._updateSize();
   },

   _updateSize: function() {
      if((this.mainBox)&&(this.displayed)) {
         let oldColumn = this.iconViewCount;
         let monitor = Main.layoutManager.findMonitorForActor(this.actor);
         if(this.fullScreen) {
            let panelTop = this._processPanelSize(false);
            let panelButton = this._processPanelSize(true);
            //Main.notify("panelTop:" + panelTop + " panelButton:" + panelButton);
            let themeNode = this.menu.getCurrentMenuThemeNode();
            let difference = this.menu.actor.get_height() - this.mainBox.get_height();
            if(difference < 0) {
               this.mainBox.set_height(monitor.height - panelButton - panelTop - 40);
               this.menu.actor.set_width(this.width);
            }
            difference = this.menu.actor.get_height() - this.mainBox.get_height();
            let bordersY = 0;
            if(themeNode)
               bordersY = themeNode.get_length('border-bottom') + themeNode.get_length('border-top') + themeNode.get_length('-boxpointer-gap');
            if(!this.appMenu)
               this.menu.actor.set_width(monitor.width);
            this.mainBox.set_height(monitor.height - panelButton - panelTop + bordersY - difference);
            this._updateView();
         } else if(this.automaticSize) {
            this.menu.actor.set_width(-1);
            this.mainBox.set_height(-1);
            this._clearView();
            if((this.bttChanger)||(this.gnoMenuBox)) {
               this.height = this.mainBox.get_height();
               this.mainBox.set_height(this.height);
            } else {
               this.height = this.mainBox.get_height();
               this.mainBox.set_height(this.height);
            }
            this._updateView();
            this.width = this.menu.actor.get_width();
            this.menu.actor.set_width(this.width);
         } else {
            let difference = this.menu.actor.get_height() - this.mainBox.get_height();
            let maxHeigth = monitor.height - this._processPanelSize(true) - this._processPanelSize(false) - difference;
            if(this.height > this.mainBox.get_height()) {
               if(this.height > maxHeigth)
                  this.height = maxHeigth;
               this.mainBox.set_height(this.height);
            } else {
               if(this.height > this.minimalHeight) {
                  this.mainBox.set_height(this.height);
                  let minHeight = this._minimalHeight();
                  if(this.height < minHeight) {
                     this.height = minHeight;
                     this.mainBox.set_height(this.height);
                  }
                  this.minimalHeight = minHeight;
               } else {
                  this.height = this.minimalHeight;
                  this.mainBox.set_height(this.height);
               }
            }
            if(this.width > monitor.width) {
               this.width = monitor.width;
               this.menu.actor.set_width(this.width);
               this._updateView();
            }
            else if(this.width > this.menu.actor.get_width()) {
               if(this.width > monitor.width)
                  this.width = monitor.width;
               this.menu.actor.set_width(this.width);
               this._updateView();
            } else if(this.width > this.minimalWidth) {
               this._clearView();
               this.menu.actor.set_width(this.width);
               let minWidth = this._minimalWidth();
               if(this.width < minWidth) {
                  this.width = minWidth;
                  this.menu.actor.set_width(this.width);
               }
               this._updateView();
               //this.minimalWidth = minWidth;
            }
         }
         this._updateSubMenuSize();
         if(oldColumn != this.iconViewCount) {
            let prev = this._previousTreeSelectedActor;
            this._clearAllSelections(false);
            this._previousTreeItemIndex = null;
            this._previousSelectedActor = null;
            this._selectedItemIndex = null;
            this._activeContainer = null;
            this._activeActor = null;
            this._previousTreeSelectedActor = this._allAppsCategoryButton.actor;
            this._previousTreeSelectedActor.set_style_class_name('menu-category-button-selected');
            this._previousTreeSelectedActor.add_style_class_name('menu-category-button-selected-' + this.theme);
            this._previousTreeSelectedActor._delegate.emit('enter-event');
         }
      }
   },

   _updateSubMenuSize: function() {
      if((this.appMenu)&&(this.mainBox)&&(this.displayed)) {
         let monitor = Main.layoutManager.findMonitorForActor(this.actor);
         if(this.fullScreen) {
            let themeNode = this.menu.getCurrentMenuThemeNode();
            let panelTop = this._processPanelSize(false);
            let panelButton = this._processPanelSize(true);
            let bordersY = themeNode.get_length('border-bottom') + themeNode.get_length('border-top') + themeNode.get_length('-boxpointer-gap');
            //this.menu.actor.set_width(-1);
            Mainloop.idle_add(Lang.bind(this, function() {
               let minWidth = this._minimalWidth();
               this.menu.actor.set_width(minWidth);
               this.appMenu.actor.set_width(monitor.width - minWidth - 3*themeNode.get_length('-arrow-border-width'));
               this.appMenu.actor.set_height(monitor.height - panelButton - panelTop + bordersY);
            }));
         }
         else if(this.automaticSize) {
            this.appMenu.actor.set_width(-1);
            this.appMenu.actor.set_height(-1);
         }
         else {
            let panelTop = this._processPanelSize(false);
            let panelButton = this._processPanelSize(true);
            if(this.subMenuHeight > monitor.height - panelTop - panelButton)
               this.subMenuHeight = monitor.height - panelTop - panelButton;
            this.appMenu.actor.set_width(this.subMenuWidth);
            this.appMenu.actor.set_height(this.subMenuHeight);
            Mainloop.idle_add(Lang.bind(this, function() {//checking correct width and revert if it's needed.
               let minWidth = this.operativePanel.width + 10;
               let minHeight = this._minimalHeight();
               if(this.subMenuWidth < minWidth) {
                  this.subMenuWidth = minWidth - 2;
                  this.appMenu.actor.set_width(this.subMenuWidth);
               }
               if(this.subMenuHeight < minHeight) {
                  this.subMenuHeight = minHeight;
                  this.appMenu.actor.set_height(this.subMenuHeight);
                  this._updateView();
               }
            }));
         }
      }
   },

   _alignSubMenu: function() {
      if(this.appMenu) {
         this.appMenuClose();
         this.appMenu.fixToScreen(this.subMenuAlign);
      }
   },

   allocationWidth: function(actor) {
      return actor.get_allocation_box().x2-actor.get_allocation_box().x1;
   },

   allocationHeight: function(actor) {
      return actor.get_allocation_box().y2-actor.get_allocation_box().y1;
   },

   _minimalHeight: function() {
      //  this.endHorizontalBox.get_height() + this.endHorizontalBox.get_height() + 10;
      let scrollBoxHeight = this.topBoxSwaper.get_height() + this.bottomBoxSwaper.get_height() + 10;
      if(!this.categoriesBox.get_vertical())
         scrollBoxHeight += this.categoriesBox.get_height();
      if(!this.favBoxWrapper.get_vertical())
         scrollBoxHeight += this.favBoxWrapper.get_height();
      if(this.gnoMenuBox)
         scrollBoxHeight += this.powerBox.actor.get_height() + 40;
      if(scrollBoxHeight + 20 < 280)
         scrollBoxHeight = 280;
      return scrollBoxHeight + 20;
   },

   _minimalWidth: function() {
      let diff = 24;
      let textVisible = this.selectedAppBox.actor.visible;
      this.selectedAppBox.actor.visible = false;
      let width = 0;//this.extendedBox.get_allocation_box().x2 - this.extendedBox.get_allocation_box().x1;
      if(this.appMenu) {
         let [minWidth, minHeight, natWidth, natHeight] = this.standardBox.get_preferred_size();
         width = minWidth;
      } else /*if((this.bttChanger)&&(this.bttChanger.getSelected() == _("All Applications")) ||
                ((this.gnoMenuBox)&&(this.gnoMenuBox.getSelected() == _("Favorites"))))*/ {
         let [minWidth, minHeight, natWidth, natHeight] = this.extendedBox.get_preferred_size();
         width = minWidth;
      }
      if((this.accessibleBox)&&(this.accessibleBox.actor.visible))
         width += this.accessibleBox.actor.get_width();

      this.selectedAppBox.actor.visible = textVisible;
      return width + diff;
   },

   _onButtonReleaseEvent: function(actor, event) {
      this._disableResize();
      if((this._draggable)&&(!this._draggable.inhibit))
         return false;
      if(!this.activateOnPress)
         this._menuEventClicked(actor, event);
      return true;
   },

   _onButtonPressEvent: function(actor, event) {
      if((this._draggable)&&(!this._draggable.inhibit))
         return false;
      if(this.activateOnPress) {
         this.pressed = true;
         this._menuEventClicked(actor, event);
      }
      return true;
   },

   _menuEventClicked: function(actor, event) {
      if(event.get_button() == 1) {
         if(this.menu.isOpen) {
            this._disconnectSearch();
         }
         this.on_applet_clicked(event)
         if(this._applet_context_menu.isOpen) {
            global.stage.set_key_focus(this.searchEntry);
            this._applet_context_menu.toggle(); 
         }
      }
      if(event.get_button() == 3) {         
         if(this._applet_context_menu._getMenuItems().length > 0) {
            this._applet_context_menu.reparentMenu(this, this.orientation);
            this._applet_context_menu.toggle();	
         }
      }
   },

   on_applet_clicked: function(event) {
      // let t = new Date().getTime();
      //global.stage.set_key_focus(this.searchEntry);
      this.menu.toggle_with_options(false);
      // let f = new Date().getTime();
      // log("time is: " + (f - t).toString());
   },

   _onSourceKeyPress: function(actor, event) {
      let symbol = event.get_key_symbol();

      if(symbol == Clutter.KEY_space || symbol == Clutter.KEY_Return) {
         this.menu.toggle();
         return true;
      } else if (symbol == Clutter.KEY_Escape && this.menu.isOpen) {
         this.menu.close();
         return true;
      } else if (symbol == Clutter.KEY_Down) {
         if(!this.menu.isOpen)
            this.menu.toggle();
         this.menu.actor.navigate_focus(this.actor, Gtk.DirectionType.DOWN, false);
         return true;
      } else
         return false;
   },

   _updateMenuSection: function() {
      if(this.menu) {
         if(this.menu.isOpen)
            this.menu.closeClean();
         this.menuManager.removeMenu(this.menu);
         this.menu.destroy();
      }
      this.menu = new ConfigurableMenu(this, this.orientation);
      this.menu.actor.connect('motion-event', Lang.bind(this, this._onResizeMotionEvent));
      this.menu.actor.connect('button-press-event', Lang.bind(this, this._onMenuButtonPress));
      this.menu.actor.connect('leave-event', Lang.bind(this, this._disableOverResizeIcon));
      this.menu.actor.connect('button-release-event', Lang.bind(this, this._onMenuButtonRelease));
      this.menu.connect('open-state-changed', Lang.bind(this, this._onOpenStateChanged));
      this.menu.actor.add_style_class_name('menu-background');
      this.menuManager.addMenu(this.menu);

      this.popupOrientation = null;

      if(!this.listView) {
         if(this._applet_context_menu) {
            this._applet_context_menu.close();
            this._menuManager.removeMenu(this._applet_context_menu);
            this._applet_context_menu.destroy();
         }
         this._applet_context_menu = new ConfigurablePopupMenu(this, this.menu, St.Side.LEFT);
         //this._applet_context_menu = new ConfigurableMenus.ConfigurableMenu(this, 0.0, St.Side.LEFT, true);
         this._menuManager.addMenu(this._applet_context_menu);

         let items = this._applet_context_menu._getMenuItems();

         this.listView = new ConfigurableMenus.PopupIconMenuItem(_("List View"), 'view-list-symbolic', St.IconType.SYMBOLIC);
         this.listView.connect('activate', Lang.bind(this, function() {
            this.iconView = !this.iconView;
            this._changeView();
         }));
         if(items.indexOf(this.listView) == -1) {
            this._applet_context_menu.addMenuItem(this.listView);
            this.listView.setSensitive(this.iconView);
         }

         this.gridView = new ConfigurableMenus.PopupIconMenuItem(_("Grid View"), 'view-grid-symbolic', St.IconType.SYMBOLIC);
         this.gridView.connect('activate', Lang.bind(this, function() {
            this.iconView = !this.iconView;
            this._changeView();
         }));
         if(items.indexOf(this.gridView) == -1) {
            this._applet_context_menu.addMenuItem(this.gridView);
            this.gridView.setSensitive(!this.iconView);
         }

         this.separatorResize = new PopupMenu.PopupSeparatorMenuItem();
         if(items.indexOf(this.separatorResize) == -1) {
            this._applet_context_menu.addMenuItem(this.separatorResize);
         }

         this.allowResize = new ConfigurableMenus.ConfigurablePopupSwitchMenuItem(_("Allow resizing"), 'changes-prevent', 'changes-allow', false);
         this.allowResize.connect('activate', Lang.bind(this, function() {
            Mainloop.idle_add(Lang.bind(this, function() {
               this.controlingSize = !this.controlingSize;
               this._activeResize();
            }));
         }));
         if (items.indexOf(this.allowResize) == -1) {
            this._applet_context_menu.addMenuItem(this.allowResize);
         }

         this.fullScreenMenu = new ConfigurableMenus.ConfigurablePopupSwitchMenuItem(_("Full Screen"), 'view-restore', 'view-fullscreen', false);
         this.fullScreenMenu.connect('activate', Lang.bind(this, function() {
            Mainloop.idle_add(Lang.bind(this, function() {
               this.fullScreen = !this.fullScreen;
               this._setFullScreen();
            }));
         }));
         if(items.indexOf(this.fullScreenMenu) == -1) {
            this._applet_context_menu.addMenuItem(this.fullScreenMenu);
         }
      }
   },

   finalizeContextMenu: function () {
      Applet.Applet.prototype.finalizeContextMenu.call(this);
      if(this.context_menu_item_configure) {
         this.context_menu_item_configure.connect('activate', Lang.bind(this, function() {
            Mainloop.idle_add(Lang.bind(this, function() {
               if(this.menu.isOpen)
                  this.menu.close();
            }));
         }));
      }
      if(this.context_menu_item_remove) {
         this.context_menu_item_remove.connect('activate', Lang.bind(this, function() {
            Mainloop.idle_add(Lang.bind(this, function() {
               if(this.menu.isOpen)
                  this.menu.close();
            }));
         }));
      }
   },

   _onMenuButtonRelease: function(actor, event) {
      try {
         if((event.get_button() == 3)&&(!this.actorResize)) {
            if((this.appMenu)&&(this.appMenu.isOpen)) {
               this.onEnterMenuGnome();
               this.appMenuClose();
            }
            this._applet_context_menu.reparentMenu(this.menu, this.popupOrientation);
            this._applet_context_menu.toggle();
         } else if(this._applet_context_menu.isOpen) {
            this._applet_context_menu.close();
         }
         this._disableResize();
      } catch(e) {
         Main.notify("Error Menu", e.message);
      }
   },

   _onMenuButtonPress: function(actor, event) {
       if(event.get_button() == 1)
          this._beginResize(actor, event); 
   },

   _onResizeMotionEvent: function(actor, event) {
      if(!this.actorResize) {
         let [mx, my] = event.get_coords();
         let [ax, ay] = actor.get_transformed_position();
         let ar = ax + actor.get_width();
         let at = ay + actor.get_height();
         if(this._isInsideMenu(mx, my, ax, ay, ar, at)) {
            if(this._correctPlaceResize(actor, mx, my, ax, ay, ar, at)) {
               this._cursorChanged = true;
               global.set_cursor(Cinnamon.Cursor.DND_MOVE);
            } else if(this._cursorChanged) {
               this._cursorChanged = false;
               global.unset_cursor();
            }
         } else if(this._cursorChanged) {
            this._cursorChanged = false;
            global.unset_cursor();
         }
      }
   },

   _findOrientation: function() {
      if(!this.popupOrientation) {
         let monitor = Main.layoutManager.findMonitorForActor(this.actor);
         let [ax, ay] = this.actor.get_transformed_position();
         this.popupOrientation = St.Side.RIGHT;
         if(ax < monitor.x + monitor.width/2)
            this.popupOrientation = St.Side.LEFT;
         this._setVisibleArrowCat();
      }
   },

   _beginResize: function(actor, event) {
      let [mx, my] = event.get_coords();
      let [ax, ay] = actor.get_transformed_position();
      let aw = actor.get_width();
      let ah = actor.get_height();
      if(this._isInsideMenu(mx, my, ax, ay, aw, ah)) {
         if(this._correctPlaceResize(actor, mx, my, ax, ay, aw, ah)) {
            if((this.appMenu)&&(this.appMenu.actor != actor)&&(this.appMenu.isOpen))
               this.appMenuClose();
            this.pressed = true;
            this.actorResize = actor;
            this._findMouseDeltha();
            global.set_cursor(Cinnamon.Cursor.DND_MOVE);
            //global.set_stage_input_mode(Cinnamon.StageInputMode.FULLSCREEN);
            this._doResize();
            return true;
         }
      }
      return false;
   },

   _findMouseDeltha: function(mx, my) {
      if(this.actorResize) {
         this.mouseDx = 0;
         this.mouseDy = 0;
            this._updatePosResize();
         this.mouseDx = this.width - this.menu.actor.get_width();
         this.mouseDy = this.height - this.mainBox.get_height();
      }
   },

   _disableResize: function() {
      //Main.notify("disable");
      //global.set_stage_input_mode(Cinnamon.StageInputMode.NORMAL);
      this.actorResize = null;
      global.unset_cursor();
      this.pressed = false;
   },

   _disableOverResizeIcon: function() {
      if(!this.actorResize) {
         global.unset_cursor();
      }
   },

   _isInsideMenu: function(mx, my, ax, ay, aw, ah) {
      return ((this.controlingSize)&&(mx > ax)&&(mx < ax + aw)&&(my > ay)&&(my < ay + ah));
   },

   _correctPlaceResize: function(actor, mx, my, ax, ay, aw, ah) {
      let monitor = Main.layoutManager.findMonitorForActor(this.actor);
      let [cx, cy] = this.actor.get_transformed_position();
      this.relativeSide = actor._delegate._boxPointer.relativeSide;
      switch (actor._delegate._arrowSide) {
         case St.Side.TOP:
            if(my > ah - this.deltaMinResize) {
               if(this.relativeSide == St.Side.RIGHT)
                  return (mx < ax + this.deltaMinResize);
               return (mx > aw - this.deltaMinResize);
            }
            return false;
         case St.Side.BOTTOM:
            if(my < ay + this.deltaMinResize) {
               if(this.relativeSide == St.Side.LEFT)
                  return (mx > aw - this.deltaMinResize);
               return  (mx < ax + this.deltaMinResize);
            }
            return false;
         case St.Side.RIGHT:
            if(mx < ax + this.deltaMinResize) {
               if(this.relativeSide == St.Side.TOP)
                  return (my > ah - this.deltaMinResize);
               return (my < ay + this.deltaMinResize);
            }
            return false;
          case St.Side.LEFT:
            if(mx > aw - this.deltaMinResize) {
               if(this.relativeSide == St.Side.BOTTOM)
                  return  (my < ay + this.deltaMinResize);
               return (my > ah - this.deltaMinResize);
            }
            return false;
      }
      return false;
   },

   _doResize: function() {
      if(this._timeOutResize > 0) {
         Mainloop.source_remove(this._timeOutResize);
      }
      this._timeOutResize = 0;
      if((this.actorResize)&&(this.relativeSide == this.actorResize._delegate._boxPointer.relativeSide)) {
         if(this._updatePosResize())
            this._updateSize();
         this._timeOutResize = Mainloop.timeout_add(300, Lang.bind(this, this._doResize));
      } else {
         this._disableResize()
      }
   },

   _updatePosResize: function() {
      if(this.actorResize) {
         let [mx, my, mask] = global.get_pointer();
         let [ax, ay] = this.actorResize.get_transformed_position();
         let aw = this.actorResize.get_width();
         let ah = this.actorResize.get_height();
         let monitor = Main.layoutManager.findMonitorForActor(this.actor);
         let [cx, cy] = this.actor.get_transformed_position();
         let width, height;

         switch (this.actorResize._delegate._arrowSide) {
            case St.Side.TOP:
               height = my - ay + 4 - this.mouseDy;
               if(cx < (monitor.x + monitor.width/2))
                  width = mx - ax - this.mouseDx;
               else
                  width = aw + ax - mx - this.mouseDx;
               break;
            case St.Side.BOTTOM:
               height = ah + ay - my + 4 - this.mouseDy;
               if(cx < (monitor.x + monitor.width/2))
                  width = mx - ax - this.mouseDx;
               else
                  width = aw + ax - mx - this.mouseDx;
               break;
            case St.Side.RIGHT:
               if(this.relativeSide == St.Side.TOP) {
                  height = my - ay + 4 - this.mouseDy;
               }
               else if(this.relativeSide == St.Side.BOTTOM) {
                  height = ah + ay - my + 4 - this.mouseDy;
               }
               if(cx < (monitor.x + monitor.width/2))
                  width = mx - ax - this.mouseDx;
               else
                  width = aw + ax - mx - this.mouseDx;
               break;
            case St.Side.LEFT:
               if(this.relativeSide == St.Side.TOP) {
                  height = my - ay + 4 - this.mouseDy;
               }
               else if(this.relativeSide == St.Side.BOTTOM) {
                  height = ah + ay - my + 4 - this.mouseDy;
               }
               if(cx < (monitor.x + monitor.width/2))
                  width = mx - ax - this.mouseDx;
               else
                  width = aw + ax - mx - this.mouseDx;
               break;
         }
         if(this.actorResize == this.menu.actor) {
            if((this.width != width)||(this.height != height)) {
               this.width = width;
               this.height = height;
               return true;
            }
         } else {
            if((this.subMenuWidth != width)||(this.subMenuHeight != height)) {
               this.subMenuWidth = width;
               this.subMenuHeight = height;
               return true;
            }
         }
      }
      return false;
   },

   _processNewPanelSize: function(bottomPosition) {
      if(Main.panelManager) {
         let [x, y] = this.actor.get_transformed_position();

         let i = 0;
         let monitor;
         for (; i < global.screen.get_n_monitors(); i++) {
            monitor = global.screen.get_monitor_geometry(i);
            if(x >= monitor.x && x < monitor.x + monitor.width &&
               x >= monitor.y && y < monitor.y + monitor.height) {
               break;
            }
         }

         let maxHeight = 0
         let panels = Main.panelManager.getPanelsInMonitor(i);
         for(let j in panels) {
            if(panels[j].bottomPosition == bottomPosition)
               maxHeight = Math.max(maxHeight, panels[j].actor.height);
         }
         return maxHeight;
      } else {
         if(bottomPosition) {
            if(!Main.panel2) {
               if(this.orientation == St.Side.BOTTOM)
                  return Main.panel.actor.height;
               else
                  return 0;
            } else {
               return Main.panel2.actor.height;
            }
         } else {
            if(!Main.panel2) {
               if(this.orientation == St.Side.BOTTOM)
                  return 0;
               else
                  return Main.panel.actor.height;
            } else {
               return Main.panel.actor.height;
            }
         }
      }
      return 0;
   },

   _processPanelSize: function(bottomPosition) {
      let panelHeight = 0;
      try {
         panelHeight = this._processNewPanelSize(bottomPosition);
         if(!panelHeight)
            panelHeight = 0;
      } catch(e) {
         panelHeight = 0;
      }
      return panelHeight;
   },

   _disconnectSearch: function() {
      this.menuIsOpening = true;
      if(this.idSignalTextChange > 0)
         this.searchEntryText.disconnect(this.idSignalTextChange);
      this.idSignalTextChange = 0;
   },

   _destroyMenuComponents: function() {//this fixed buggs Cjs-CRITICAL **: Attempting to call back into JSAPI
      if(this.searchAppSeparator)
         this.searchAppSeparator.destroy();
      if(this.packageAppSeparator)
         this.packageAppSeparator.destroy();
      if(this.selectedAppBox)
         this.selectedAppBox.destroy();
      if(this.separatorTop)
         this.separatorTop.destroy();
      if(this.separatorMiddle)
         this.separatorMiddle.destroy();
      if(this.separatorBottom)
         this.separatorBottom.destroy();
      if(this.hover)
         this.hover.destroy();
      if(this.powerBox)
         this.powerBox.destroy();
      if(this.favoritesObj)
         this.favoritesObj.actor.destroy();

      if(this.menu.isOpen)
         this.menu.closeClean();
      this._disconnectSearch();
         this.menu.removeAll();
   },

   _display: function() {
      try {
         this._destroyMenuComponents();

         this.minimalWidth = -1;
         this.minimalHeight = -1;
         this.displayed = false;
         this.allowFavName = false;
         this.bttChanger = null;
         this._activeContainer = null;
         this._activeActor = null;
         this.vectorBox = null;
         this.actor_motion_id = 0;
         this.vector_update_loop = null;
         this.current_motion_actor = null;
         this._previousSearchPattern = "";
         
         let section = new PopupMenu.PopupMenuSection();
         this.menu.addMenuItem(section);

         this.standardBox = new St.BoxLayout({ vertical:false });

         this.rightPane = new St.BoxLayout({ vertical: true });
         this.beginBox = new St.BoxLayout({ vertical: true });
         this.endBox = new St.BoxLayout({ vertical: true });
         this.rightPane.add_actor(this.beginBox);      
//search
         this.topBoxSwaper = new St.BoxLayout({ vertical: false });
         this.bottomBoxSwaper = new St.BoxLayout({ vertical: false });

         this.changeTopBox = new St.BoxLayout({ vertical: true });
         this.changeTopBoxUp = new St.BoxLayout({ vertical: false });
         this.changeTopBoxDown = new St.BoxLayout({ vertical: false });

         this.changeBottomBox = new St.BoxLayout({ vertical: true });
         this.changeBottomBoxUp = new St.BoxLayout({ vertical: false });
         this.changeBottomBoxDown = new St.BoxLayout({ vertical: false });

         this.topBoxSwaper.add(this.changeTopBox, {x_fill: true, y_fill: true, x_align: St.Align.START, y_align: St.Align.START, expand: true });

         this.searchBox = new St.BoxLayout();
         this.searchBox.set_style_class_name('menu-search-box-' + this.theme);

         this.searchEntry = new St.Entry({ name: 'menu-search-entry',
                                           hint_text: _("Type to search..."),
                                           track_hover: true,
                                           can_focus: true });

         this.searchEntry.set_secondary_icon(this._searchInactiveIcon);

         this.searchActive = false;
         this.searchEntryText = this.searchEntry.clutter_text;
         this.searchEntryText.connect('key-press-event', Lang.bind(this, this._onMenuKeyPress));
         this.idSignalTextChange = 0;
         this.searchEntryText.connect('key-focus-in', Lang.bind(this, function(actor) {
            if(this.idSignalTextChange == 0)
               this.idSignalTextChange = this.searchEntryText.connect('text-changed', Lang.bind(this, this._onSearchTextChanged));
         }));
         this.searchEntryText.connect('key-focus-out', Lang.bind(this, function(actor) {
            this._disconnectSearch();
         }));

         this.searchName = new St.Label({ style_class: 'menu-selected-app-title', text: _("Filter:"), visible: false });
         this.searchName.style = "font-size: " + 10 + "pt";
         this.panelAppsName = new St.Label({ style_class: 'menu-selected-app-title', text: _("Favorites"), visible: false });
         this.panelAppsName.style = "font-size: " + 10 + "pt";

         this.searchBox.add(this.searchName, {x_fill: false, x_align: St.Align.START, y_align: St.Align.MIDDLE, y_fill: false, expand: false });
         this.searchBox.add(this.searchEntry, {x_fill: true, x_align: St.Align.START, y_align: St.Align.MIDDLE, y_fill: false, expand: true });

         this.controlView = new MenuBox.ControlBox(this, this.iconControlSize);

//search
         this.hover = new MenuBox.HoverIconBox(this, this.iconHoverSize);
         this.hover.actor.connect('key-press-event', Lang.bind(this, this._onMenuKeyPress));
         this.hover.menu.actor.connect('key-press-event', Lang.bind(this, this._onMenuKeyPress));

         this.categoriesApplicationsBox = new MenuBox.CategoriesApplicationsBox();

         this.categoriesBox = new St.BoxLayout({ style_class: 'menu-categories-box', vertical: true });
         //this.categoriesBox = new St.BoxLayout({ style_class: 'menu-categories-box', vertical: true, accessible_role: Atk.Role.LIST });
         this.categoriesSpaceUp = new St.BoxLayout({ style_class: 'menu-categories-space-' + this.theme });
         this.categoriesSpaceDown = new St.BoxLayout({ style_class: 'menu-categories-space-' + this.theme });
         this.categoriesBox.add_style_class_name('menu-categories-box-' + this.theme);
         this.applicationsBox = new St.BoxLayout({ style_class: 'menu-applications-box', vertical: true });
         this.applicationsBox.add_style_class_name('menu-applications-box-' + this.theme);
         this.standarAppBox = new St.BoxLayout({ vertical: false });
         this.searchAppBox = new St.BoxLayout({ vertical: false });
         this.packageAppBox = new St.BoxLayout({ vertical: false });
         this.applicationsBox.add(this.standarAppBox, { x_fill: true, y_fill: true, x_align: St.Align.START, y_align: St.Align.START, expand: true });
         this.searchAppSeparator = new PopupMenu.PopupSeparatorMenuItem();
         this.searchAppSeparator.actor.hide();
         this.applicationsBox.add(this.searchAppSeparator.actor, { x_fill: true, y_fill: true, x_align: St.Align.START, y_align: St.Align.START, expand: true });
         this.applicationsBox.add(this.searchAppBox, { x_fill: true, y_fill: true, x_align: St.Align.START, y_align: St.Align.START, expand: true });
         this.packageAppSeparator = new PopupMenu.PopupSeparatorMenuItem();
         this.packageAppSeparator.actor.hide();
         this.applicationsBox.add(this.packageAppSeparator.actor, { x_fill: true, y_fill: true, x_align: St.Align.START, y_align: St.Align.START, expand: true });
         this.applicationsBox.add(this.packageAppBox, { x_fill: true, y_fill: true, x_align: St.Align.START, y_align: St.Align.START, expand: true });
         this.pkg.setSearchBox(this.packageAppBox, this.packageAppSeparator.actor);

         this.favoritesBox = new St.BoxLayout({ vertical: true, style_class: 'menu-favorites-box-internal' });
         this.favoritesBox.add_style_class_name('menu-favorites-box-internal-' + this.theme);
         this.favBoxWrapper = new St.BoxLayout({ vertical: true, style_class: 'menu-favorites-box' });
         this.favBoxWrapper.add_style_class_name('menu-favorites-box-' + this.theme);

         this.endVerticalBox = new St.BoxLayout({ vertical: true });
         this.endHorizontalBox = new St.BoxLayout({ vertical: false });

         this.selectedAppBox = new MenuBox.SelectedAppBox(this, this.showTimeDate);

         this.betterPanel = new St.BoxLayout({ vertical: false });
         this.operativePanel = new St.BoxLayout({ vertical: false });
         this.operativePanelExpanded = new St.BoxLayout({ vertical: true});
         this.categoriesWrapper = new St.BoxLayout({ vertical: true });

         this.mainBox = new St.BoxLayout({ vertical: false });
         this.menuBox = new St.BoxLayout({ vertical: false, style_class: 'menu-main-box'});
         this.menuBox.add_style_class_name('menu-main-box-' + this.theme);
         this.menuBox.add(this.mainBox, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});


         this.extendedBox = new St.BoxLayout({ vertical: true });
         this.extendedBox.add(this.standardBox, { x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});

         this.separatorTop = new MenuBox.SeparatorBox(this.showSeparatorLine, this.separatorSize);
         this.separatorMiddle = new MenuBox.SeparatorBox(this.showSeparatorLine, this.separatorSize);
         this.separatorBottom = new MenuBox.SeparatorBox(this.showSeparatorLine, this.separatorSize);

         this.separatorTop.separatorLine.actor.add_style_class_name('menu-separator-top-' + this.theme);
         this.separatorMiddle.separatorLine.actor.add_style_class_name('menu-separator-center-' + this.theme);
         this.separatorBottom.separatorLine.actor.add_style_class_name('menu-separator-bottom-' + this.theme);

         this.powerBox = new MenuBox.PowerBox(this, this.powerTheme, this.iconPowerSize, this.hover, this.selectedAppBox);

         switch(this.theme) {
            case "classic"        :
                          this.loadClassic(); 
                          break;
            case "classicGnome"   :
                          this.loadClassicGnome(); 
                          break;
            case "whisker"        :
                          this.loadWhisker(); 
                          break;
            case "kicker"        :
                          this.loadKicker(); 
                          break;
            case "gnomenuLeft"    :
                          this.loadGnoMenuLeft(); 
                          break;
            case "gnomenuRight"   :
                          this.loadGnoMenuRight(); 
                          break;
            case "gnomenuTop"     :
                          this.loadGnoMenuTop(); 
                          break;
            case "gnomenuBottom"  :
                          this.loadGnoMenuBottom(); 
                          break;
            case "vampire"        :
                          this.loadVampire(); 
                          break;
            case "garibaldo"      :
                          this.loadGaribaldo(); 
                          break;
            case "stylized"       :
                          this.loadStylized(); 
                          break;
            case "dragon"         :
                          this.loadDragon(); 
                          break;
            case "dragonInverted" :
                          this.loadDragonInverted(); 
                          break;
            case "luzHelena"      :
                          this.loadLuzHelena(); 
                          break;
            case "accessible"     :
                          this.loadAccessible(); 
                          break;
            case "accessibleInverted":
                          this.loadAccessibleInverted(); 
                          break;
            case "mint"              :
                          this.loadMint(); 
                          break;
            case "windows7"           :
                          this.loadWindows(); 
                          break;
            default                  :
                          this.loadClassic(); 
                          break;
         }

         this._updateVFade();
         this._updateSeparators();

         this.rightPane.add(this.categoriesApplicationsBox.actor, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});

         this.favoritesBox.add(this.favoritesObj.actor, { x_fill: true, y_fill: true, x_align: St.Align.END, y_align: St.Align.MIDDLE, expand: false });

         this.categoriesApplicationsBox.actor.add(this.betterPanel, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});

         this.appBoxIter = new VisibleChildIterator(this, this.applicationsBox, this.iconViewCount);
         this.applicationsBox._vis_iter = this.appBoxIter;
         this.catBoxIter = new VisibleChildIterator(this, this.categoriesBox, 1);
         this.categoriesBox._vis_iter = this.catBoxIter;

         this._refreshApps();

         this._onSearchEnginesChanged();

         this._update_autoscroll();
         
         section.actor.add(this.menuBox, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});

      } catch(e) {
         Main.notify("ErrorDisplay:", e.message);
      }
   },

   _packageInstallerChanged: function() {
      if(this.enableInstaller) {
         if(!this.pkg.exist())
            this.pkg.executeUpdater("--qupdate gui");
         else
            this.pkg.executeUpdater("--qupdate test");
      } else {
         this.enablePackageSearch = false;
         this.enableCheckUpdate = false;
      }
   },

   _packageSearchChanged: function() {
      if(!this.enablePackageSearch)
         this.pkg.cleanSearch();
   },

   _packageMaxSearchChanged: function() {
      this.pkg.setMaxSearch(this.installerMaxSearch);
   },

   _packageInstallerCheck: function() {
      if(this.enableCheckUpdate)
         this.pkg.checkForUpdate();
   },

   _packageInstallerDefault: function() {
      this.pkg.enableDefaultInstaller(this.enableDefaultInstaller);
   },

   _updateInstaller: function() {
      this.pkg.executeUpdater("--qupdate gui");
   },

   _uninstallInstaller: function() {
      this.pkg.executeUpdater("--uninstall gui");
      Main.notify("Cinnamon Installer was removed");
      this.enablePackageSearch = false;
      this.enableCheckUpdate = false;
      this.enableInstaller = false;
   },

   _onSearchEnginesChanged: function() {
      this._searchList = new Array();
      this._searchItems.forEach(function(item) {
         item.actor.destroy();
      });
      let language = Gtk.get_default_language().to_string();
      if(language) {
         let locale = language.substr(0, language.indexOf("-"));
         if(locale) language = locale;
      }
      if(!language)
         language = "en";
      this._searchItems = [];
      if(this.searchWeb) {
         if(this.searchDuckduckgo)
            this._searchList.push(["DuckDuckGo", "https://duckduckgo.com/?t=lm&q=", "duckduckgo.svg"]);
         if(this.searchWikipedia)
            this._searchList.push(["Wikipedia", "http://" + language + ".wikipedia.org/wiki/Special:Search?search=", "wikipedia.svg"]);
         if(this.searchGoogle)
            this._searchList.push(["Google", "http://www.google.com/cse?cx=002683415331144861350%3Atsq8didf9x0&ie=utf-8&sa=Search&q=", "google.svg"]);
         let path, button;
         for(let i in this._searchList) {
            path = this._searchList[i][2];
            if(path.indexOf("/") == -1)
               path = this.metadata.path + "/icons/" + path;
            button = new MenuItems.SearchItem(this.menu, this._searchList[i][0], this._searchList[i][1], path,
                                    this.iconAppSize, this.textButtonWidth, this.appButtonDescription, this.iconView);
            if(this._applicationsBoxWidth > 0)
               button.container.set_width(this._applicationsBoxWidth);
               
            button.actor.connect('leave-event', Lang.bind(this, this._appLeaveEvent, button));
            this._addEnterEvent(button, Lang.bind(this, this._appEnterEvent, button));
            this._searchItems.push(button);
         }
      }
   },

   _getUserLocale: function() {
   },

   loadClassic: function() {
      this.operativePanel.add(this.categoriesWrapper, { x_fill: true, y_fill: true, expand: false });
      this.applicationsScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.applicationsBox, true, St.Align.START);
      this.topBoxSwaper.add(this.hover.container, {x_fill: false, x_align: St.Align.MIDDLE, y_align: St.Align.START, expand: true });
      this.changeTopBoxUp.add(this.controlView.actor, {x_fill: true, y_fill: false, x_align: St.Align.START, y_align: St.Align.START, expand: true });
      this.changeTopBoxDown.add(this.searchBox, { x_fill: false, y_fill: false, x_align: St.Align.START, y_align: St.Align.END, expand: true });
      this.favoritesObj = new MenuBox.FavoritesBoxExtended(this, true, this.favoritesLinesNumber);
      this.categoriesScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.categoriesBox, true, St.Align.START);
      this.favoritesScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.favoritesBox, true, St.Align.START);
      this.favBoxWrapper.add(this.favoritesScrollBox.actor, { y_fill: false, y_align: St.Align.START, expand: true });
      this.categoriesWrapper.add(this.categoriesScrollBox.actor, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.categoriesWrapper.add(this.categoriesSpaceDown, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.operativePanelExpanded.add(this.favBoxWrapper, { y_fill: false, y_align: St.Align.START, expand: true });
      this.operativePanelExpanded.add(this.powerBox.actor, { y_align: St.Align.END, y_fill: false, expand: false });
      this.standardBox.add(this.operativePanelExpanded, { y_align: St.Align.END, y_fill: true, expand: false });
      this.standardBox.add(this.rightPane, { span: 2, x_fill: true, expand: true });
      this.rightPane.add_actor(this.separatorTop.actor);
      this.betterPanel.add(this.operativePanel, { x_fill: true, y_fill: true, y_align: St.Align.START, expand: true });
       this.mainBox.add(this.extendedBox, { x_fill: true, y_fill: true, y_align: St.Align.START, expand: true });
      this.extendedBox.add(this.endVerticalBox, { x_fill: true, y_fill: false, y_align: St.Align.END, expand: false });
      this.endHorizontalBox.add(this.selectedAppBox.actor, { x_fill: true, y_fill: false, x_align: St.Align.END, y_align: St.Align.MIDDLE, expand: true });
      this.endVerticalBox.add_actor(this.separatorBottom.actor);
      this.endVerticalBox.add_actor(this.endBox);
      this.bottomBoxSwaper.add(this.endHorizontalBox, { x_fill: true, y_fill: true, expand: true });
      this.bottomBoxSwaper.add_actor(this.changeBottomBox);
      this.operativePanel.add(this.applicationsScrollBox.actor, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.operativePanel.set_style_class_name('menu-operative-box');
   },

   loadWhisker: function() {
      this.applicationsScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.applicationsBox, true, St.Align.START);
      this.changeTopBoxDown.add(this.searchBox, {x_fill: true, y_fill: false, x_align: St.Align.START, y_align: St.Align.MIDDLE, expand: true });
      this.changeTopBoxDown.add(this.controlView.actor, {x_fill: true, y_fill: false, x_align: St.Align.END, y_align: St.Align.MIDDLE, expand: true });
      this.favoritesObj = new MenuBox.FavoritesBoxExtended(this, true, this.favoritesLinesNumber);
      this.categoriesScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.categoriesBox, true, St.Align.START);
      this.favoritesScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.favoritesBox, true, St.Align.START);
      this.favBoxWrapper.add(this.favoritesScrollBox.actor, { y_fill: false, y_align: St.Align.START, expand: true });
      this.categoriesWrapper.add(this.categoriesScrollBox.actor, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.categoriesWrapper.add(this.categoriesSpaceDown, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.changeTopBoxUp.add(this.hover.container, { x_fill: false, y_fill: false, x_align: St.Align.START, y_align: St.Align.MIDDLE, expand: true });
      this.changeTopBoxUp.add(this.powerBox.actor, { x_fill: false, y_fill: false, x_align: St.Align.END, y_align: St.Align.MIDDLE, expand: true });
      this.betterPanel.add(this.favBoxWrapper, { y_align: St.Align.MIDDLE, y_fill: true, expand: false });
      this.standardBox.add(this.rightPane, { span: 2, x_fill: true, expand: true });
      this.rightPane.add_actor(this.separatorTop.actor);
      this.betterPanel.add(this.operativePanel, { x_fill: true, y_fill: true, y_align: St.Align.START, expand: true });
      this.mainBox.add(this.extendedBox, { x_fill: true, y_fill: true, y_align: St.Align.START, expand: true });
      this.extendedBox.add(this.endVerticalBox, { x_fill: true, y_fill: false, y_align: St.Align.END, expand: false });
      this.endVerticalBox.add_actor(this.separatorBottom.actor, { x_fill: true, y_fill: true, expand: true });
      this.endVerticalBox.add(this.endBox, { x_fill: true, y_fill: true, expand: true });
      this.bottomBoxSwaper.add(this.selectedAppBox.actor, { x_fill: true, y_fill: true, expand: true });
      this.bottomBoxSwaper.add_actor(this.changeBottomBox);
      this.changeBottomBox.add_actor(this.endHorizontalBox);
      this.operativePanel.add(this.applicationsScrollBox.actor, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.operativePanel.add(this.categoriesWrapper, { x_fill: true, y_fill: true, expand: false });
      this.operativePanel.set_style_class_name('menu-operative-box');
   },

   loadVampire: function() {
      this.operativePanel.add(this.categoriesWrapper, { x_fill: true, y_fill: true, expand: false });
      this.applicationsScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.applicationsBox, true, St.Align.START);
      this.changeTopBox.add(this.controlView.actor, {x_fill: true, y_fill: false, x_align: St.Align.START, y_align: St.Align.MIDDLE, expand: true });
      this.topBoxSwaper.add(this.searchBox, {x_fill: false, y_fill: false, x_align: St.Align.END, y_align: St.Align.MIDDLE, expand: true });
      this.favoritesObj = new MenuBox.FavoritesBoxExtended(this, true, this.favoritesLinesNumber);
      this.categoriesScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.categoriesBox, true, St.Align.START);
      this.favoritesScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.favoritesBox, true, St.Align.START);
      this.favBoxWrapper.add(this.favoritesScrollBox.actor, { y_fill: false, y_align: St.Align.START, expand: true });
      this.categoriesWrapper.add(this.categoriesScrollBox.actor, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.categoriesWrapper.add(this.categoriesSpaceDown, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.selectedAppBox.setAlign(St.Align.START);
      this.endHorizontalBox.add(this.hover.container, { x_fill: false, x_align: St.Align.END, expand: false });
      this.endHorizontalBox.add(this.selectedAppBox.actor, { x_fill: true, y_fill: false, x_align: St.Align.START, y_align: St.Align.MIDDLE, expand: true });
      this.endHorizontalBox.add(this.powerBox.actor, { x_fill: false, y_fill: false, x_align: St.Align.END, expand: false });
      this.betterPanel.add(this.favBoxWrapper, { y_align: St.Align.MIDDLE, y_fill: true, expand: false });
      this.standardBox.add(this.rightPane, { span: 2, x_fill: true, expand: true });
      this.rightPane.add_actor(this.separatorTop.actor);
      this.betterPanel.add(this.operativePanel, { x_fill: true, y_fill: true, y_align: St.Align.START, expand: true });
      this.mainBox.add(this.extendedBox, { x_fill: true, y_fill: true, y_align: St.Align.START, expand: true });
      this.extendedBox.add(this.endVerticalBox, { x_fill: true, y_fill: false, y_align: St.Align.END, expand: false });
      this.endVerticalBox.add_actor(this.separatorBottom.actor, { x_fill: true, y_fill: true, expand: true });
      this.endVerticalBox.add(this.endBox, { x_fill: true, y_fill: true, expand: true });
      this.bottomBoxSwaper.add(this.endHorizontalBox, { x_fill: true, y_fill: true, expand: true });
      this.bottomBoxSwaper.add_actor(this.changeBottomBox);
      this.operativePanel.add(this.applicationsScrollBox.actor, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.operativePanel.set_style_class_name('menu-operative-box');
   },

   loadGaribaldo: function() {
      this.operativePanel.add(this.categoriesWrapper, { x_fill: true, y_fill: true, expand: false });
      this.applicationsScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.applicationsBox, true, St.Align.START);
      this.changeTopBox.add(this.searchBox, {x_fill: false, y_fill: false, x_align: St.Align.START, y_align: St.Align.MIDDLE, expand: true });
      this.topBoxSwaper.add(this.controlView.actor, {x_fill: true, x_align: St.Align.END, y_align: St.Align.MIDDLE, expand: true });
      this.favoritesObj = new MenuBox.FavoritesBoxExtended(this, true, this.favoritesLinesNumber);
      this.categoriesScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.categoriesBox, true, St.Align.START);
      this.favoritesScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.favoritesBox, true, St.Align.START);
      this.favBoxWrapper.add(this.favoritesScrollBox.actor, { y_fill: false, y_align: St.Align.START, expand: true });
      this.operativePanelExpanded.add(this.favBoxWrapper, { y_fill: false, y_align: St.Align.START, expand: true });
      this.categoriesWrapper.add(this.categoriesScrollBox.actor, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.categoriesWrapper.add(this.categoriesSpaceDown, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.operativePanelExpanded.add(this.powerBox.actor, { y_align: St.Align.END, y_fill: false, expand: false });
      this.endHorizontalBox.add(this.selectedAppBox.actor, { x_fill: true, y_fill: false, x_align: St.Align.START, y_align: St.Align.MIDDLE, expand: true });
      this.endHorizontalBox.add(this.hover.container, { x_fill: false, x_align: St.Align.END, expand: false });
      this.betterPanel.add(this.operativePanelExpanded, { y_align: St.Align.MIDDLE, y_fill: true, expand: false });
      this.standardBox.add(this.rightPane, { span: 2, x_fill: true, expand: true });
      this.rightPane.add_actor(this.separatorTop.actor);
      this.betterPanel.add(this.operativePanel, { x_fill: true, y_fill: true, y_align: St.Align.START, expand: true });
      this.mainBox.add(this.extendedBox, { x_fill: true, y_fill: true, y_align: St.Align.START, expand: true });
      this.extendedBox.add(this.endVerticalBox, { x_fill: true, y_fill: false, y_align: St.Align.END, expand: false });
      this.endVerticalBox.add_actor(this.separatorBottom.actor);
      this.endVerticalBox.add(this.endBox, { x_fill: true, y_fill: true, expand: true });
      this.bottomBoxSwaper.add(this.endHorizontalBox, { x_fill: true, y_fill: true, expand: true });
      this.bottomBoxSwaper.add_actor(this.changeBottomBox);
      this.operativePanel.add(this.applicationsScrollBox.actor, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.operativePanel.set_style_class_name('menu-operative-box');
   },

   loadStylized: function() {
      this.operativePanel.add(this.categoriesWrapper, { x_fill: true, y_fill: true, expand: false });
      this.applicationsScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.applicationsBox, true, St.Align.START);
      this.topBoxSwaper.add(this.hover.container, {x_fill: false, x_align: St.Align.MIDDLE, y_align: St.Align.START, expand: true });
      this.changeTopBoxUp.add(this.controlView.actor, {x_fill: true, y_fill: false, x_align: St.Align.START, y_align: St.Align.START, expand: true });
      this.changeTopBoxDown.add(this.searchBox, { x_fill: false, y_fill: false, x_align: St.Align.START, y_align: St.Align.END, expand: true });
      this.favoritesObj = new MenuBox.FavoritesBoxExtended(this, true, this.favoritesLinesNumber);
      this.categoriesScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.categoriesBox, true, St.Align.START);
      this.favoritesScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.favoritesBox, true, St.Align.START);
      this.favBoxWrapper.add(this.favoritesScrollBox.actor, { y_fill: false, y_align: St.Align.START, expand: true });
      this.categoriesWrapper.add(this.categoriesScrollBox.actor, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.categoriesWrapper.add(this.categoriesSpaceDown, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.standardBox.add(this.favBoxWrapper, { y_align: St.Align.MIDDLE, y_fill: true, expand: false });
      this.standardBox.add(this.rightPane, { span: 2, x_fill: true, expand: true });
      this.rightPane.add_actor(this.separatorTop.actor);
      this.betterPanel.add(this.operativePanel, { x_fill: true, y_fill: true, y_align: St.Align.START, expand: true });
      this.mainBox.add(this.extendedBox, { x_fill: true, y_fill: true, y_align: St.Align.START, expand: true });
      this.extendedBox.add(this.endVerticalBox, { x_fill: true, y_fill: false, y_align: St.Align.END, expand: false });
      this.endHorizontalBox.add(this.selectedAppBox.actor, { x_fill: true, y_fill: false, x_align: St.Align.END, y_align: St.Align.MIDDLE, expand: true });
      this.endHorizontalBox.add(this.powerBox.actor, { x_fill: false, x_align: St.Align.END, expand: false });
      this.endVerticalBox.add_actor(this.separatorBottom.actor);
      this.endVerticalBox.add(this.endBox, { x_fill: true, y_fill: true, expand: true });
      this.bottomBoxSwaper.add(this.endHorizontalBox, { x_fill: true, y_fill: true, expand: true });
      this.bottomBoxSwaper.add_actor(this.changeBottomBox);
      this.operativePanel.add(this.applicationsScrollBox.actor, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.operativePanel.set_style_class_name('menu-operative-box');
   },

   loadDragon: function() {
      this.operativePanel.set_vertical(true);
      this.categoriesBox.set_vertical(false);
      this.categoriesWrapper.set_vertical(false);
      this.operativePanel.add(this.categoriesWrapper, { x_fill: true, y_fill: true, expand: false });
      this.applicationsScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.applicationsBox, true, St.Align.START);
      this.changeTopBoxUp.add(this.hover.container, {x_fill: false, x_align: St.Align.START, y_align: St.Align.START, expand: false });
      this.changeTopBoxUp.add(this.selectedAppBox.actor, {x_fill: true, y_fill: false, x_align: St.Align.START, y_align: St.Align.MIDDLE, expand: true });
      this.topBoxSwaper.add(this.controlView.actor, {x_fill: false, x_align: St.Align.END, y_align: St.Align.MIDDLE, y_fill: false, expand: true });
      this.selectedAppBox.setAlign(St.Align.START);
      this.favoritesObj = new MenuBox.FavoritesBoxExtended(this, true, this.favoritesLinesNumber);
      this.operativePanel.add(this.separatorMiddle.actor, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.categoriesScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.categoriesBox, false, St.Align.START);
      this.favoritesScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.favoritesBox, true, St.Align.START);
      this.favBoxWrapper.add(this.favoritesScrollBox.actor, { y_fill: false, y_align: St.Align.START, expand: true });
      this.categoriesWrapper.add(this.categoriesSpaceUp, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.categoriesWrapper.add(this.categoriesScrollBox.actor, {x_fill: false, y_fill: true, y_align: St.Align.MIDDLE, expand: true});
      this.categoriesWrapper.add(this.categoriesSpaceDown, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.standardBox.add(this.rightPane, { span: 2, x_fill: true, expand: true });
      this.rightPane.add_actor(this.separatorTop.actor);
      this.betterPanel.add(this.favBoxWrapper, { y_align: St.Align.END, y_fill: true, expand: false });
      this.betterPanel.add(this.operativePanelExpanded, { x_fill: true, y_fill: true, y_align: St.Align.START, expand: true });
      this.operativePanelExpanded.add(this.operativePanel, { x_fill: true, y_fill: false, y_align: St.Align.START, expand: true });
      this.mainBox.add(this.extendedBox, { x_fill: true, y_fill: true, y_align: St.Align.START, expand: true });
      this.extendedBox.add(this.endVerticalBox, { x_fill: true, y_fill: false, y_align: St.Align.END, expand: false });
      this.endHorizontalBox.add(this.searchBox, { x_fill: true, y_fill: false, x_align: St.Align.START, y_align: St.Align.MIDDLE, expand: true });
      this.endHorizontalBox.add(this.powerBox.actor, { x_fill: false, x_align: St.Align.END, expand: false });
      this.endVerticalBox.add_actor(this.separatorBottom.actor);
      this.endVerticalBox.add(this.endBox, { x_fill: true, y_fill: true, expand: true });
      this.bottomBoxSwaper.add(this.endHorizontalBox, { x_fill: true, y_fill: true, expand: true });
      this.bottomBoxSwaper.add_actor(this.changeBottomBox);
      this.operativePanel.add(this.applicationsScrollBox.actor, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.operativePanelExpanded.set_style_class_name('menu-operative-box');
   },

   loadDragonInverted: function() {
      this.operativePanel.set_vertical(true);
      this.categoriesBox.set_vertical(false);
      this.categoriesWrapper.set_vertical(false);
      this.operativePanel.add(this.categoriesWrapper, { x_fill: true, y_fill: true, expand: false });
      this.applicationsScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.applicationsBox, true, St.Align.START);
      this.changeTopBox.add(this.controlView.actor, {x_fill: false, y_fill: false, x_align: St.Align.START, y_align: St.Align.MIDDLE, expand: true });
      this.topBoxSwaper.add(this.selectedAppBox.actor, {x_fill: false, x_align: St.Align.START, y_align: St.Align.MIDDLE, expand: false });
      this.topBoxSwaper.add(this.hover.container, {x_fill: false, x_align: St.Align.END, y_align: St.Align.MIDDLE, y_fill: false, expand: false });
      this.favoritesObj = new MenuBox.FavoritesBoxExtended(this, true, this.favoritesLinesNumber);
      this.operativePanel.add(this.separatorMiddle.actor, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.categoriesScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.categoriesBox, false, St.Align.START);
      this.favoritesScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.favoritesBox, true, St.Align.START);
      this.favBoxWrapper.add(this.favoritesScrollBox.actor, { y_fill: false, y_align: St.Align.START, expand: true });
      this.categoriesWrapper.add(this.categoriesSpaceUp, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.categoriesWrapper.add(this.categoriesScrollBox.actor, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.categoriesWrapper.add(this.categoriesSpaceDown, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.standardBox.add(this.rightPane, { span: 2, x_fill: true, expand: true });
      this.rightPane.add_actor(this.separatorTop.actor);
      this.operativePanelExpanded.add(this.operativePanel, { x_fill: true, y_fill: false, y_align: St.Align.START, expand: true });
      this.betterPanel.add(this.operativePanelExpanded, { x_fill: true, y_fill: true, y_align: St.Align.START, expand: true });
      this.betterPanel.add(this.favBoxWrapper, { y_align: St.Align.END, y_fill: true, expand: false });
      this.mainBox.add(this.extendedBox, { x_fill: true, y_fill: true, y_align: St.Align.START, expand: true });
      this.extendedBox.add(this.endVerticalBox, { x_fill: true, y_fill: false, y_align: St.Align.END, expand: false });
      this.endHorizontalBox.add(this.searchBox, { x_fill: true, y_fill: false, x_align: St.Align.START, y_align: St.Align.MIDDLE, expand: true });
      this.endHorizontalBox.add(this.powerBox.actor, { x_fill: false, x_align: St.Align.END, expand: false });
      this.endVerticalBox.add_actor(this.separatorBottom.actor);
      this.endVerticalBox.add(this.endBox, { x_fill: true, y_fill: true, expand: true });
      this.bottomBoxSwaper.add(this.endHorizontalBox, { x_fill: true, y_fill: true, expand: true });
      this.bottomBoxSwaper.add_actor(this.changeBottomBox);
      this.operativePanel.add(this.applicationsScrollBox.actor, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.operativePanelExpanded.set_style_class_name('menu-operative-box');
   },

   loadLuzHelena: function() {
      this.operativePanel.set_vertical(true);
      this.categoriesBox.set_vertical(false);
      this.categoriesWrapper.set_vertical(false);
      this.favBoxWrapper.set_vertical(false);
      this.operativePanel.add(this.categoriesWrapper, { x_fill: true, y_fill: true, expand: false });
      this.applicationsScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.applicationsBox, true, St.Align.START);
      this.changeTopBoxUp.add(this.hover.container, {x_fill: false, x_align: St.Align.END, y_align: St.Align.MIDDLE, expand: true });
      this.changeTopBoxUp.add(this.selectedAppBox.actor, { x_fill: true, y_fill: false, x_align: St.Align.START, y_align: St.Align.MIDDLE, expand: true });
      this.selectedAppBox.setAlign(St.Align.START);
      this.favoritesObj = new MenuBox.FavoritesBoxExtended(this, false, this.favoritesLinesNumber);
      this.categoriesScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.categoriesBox, false, St.Align.START);
      this.favoritesScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.favoritesBox, false, St.Align.START);
      this.favBoxWrapper.add(this.favoritesScrollBox.actor, { x_fill: false, x_align: St.Align.MIDDLE, expand: true });
      this.categoriesWrapper.add(this.categoriesSpaceUp, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.categoriesWrapper.add(this.categoriesScrollBox.actor, {x_fill: false, y_fill: true, y_align: St.Align.MIDDLE, expand: true});
      this.categoriesWrapper.add(this.categoriesSpaceDown, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.standardBox.add(this.rightPane, { span: 2, x_fill: true, expand: true });
      this.rightPane.add_actor(this.separatorTop.actor);
      this.operativePanelExpanded.add(this.operativePanel, { x_fill: true, y_fill: false, y_align: St.Align.START, expand: true });
      this.betterPanel.add(this.operativePanelExpanded, { x_fill: true, y_fill: true, y_align: St.Align.START, expand: true });
      this.operativePanel.add_actor(this.separatorMiddle.actor);
      this.endVerticalBox.add(this.favBoxWrapper, { x_fill: true, y_fill: false, y_align: St.Align.END, expand: true });
      this.endVerticalBox.add(this.separatorBottom.actor);
      this.mainBox.add(this.extendedBox, { x_fill: true, y_fill: true, y_align: St.Align.START, expand: true });
      this.extendedBox.add(this.endVerticalBox, { x_fill: true, y_fill: false, y_align: St.Align.END, expand: false });
      this.endHorizontalBox.add(this.controlView.actor, { x_fill: false, y_fill: false, x_align: St.Align.START, y_align: St.Align.MIDDLE, expand: false });
      this.endHorizontalBox.add(this.searchBox, { x_fill: false, y_fill: false, x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE, expand: true });
      this.endHorizontalBox.add(this.powerBox.actor, { x_fill: false, y_fill: false, x_align: St.Align.END, y_align: St.Align.MIDDLE, expand: false });
      this.endVerticalBox.add(this.endBox, { x_fill: true, y_fill: false, y_align: St.Align.END, expand: false });
      this.bottomBoxSwaper.add(this.endHorizontalBox, { x_fill: true, y_fill: true, expand: true });
      this.bottomBoxSwaper.add_actor(this.changeBottomBox);
      this.operativePanel.add(this.applicationsScrollBox.actor, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.operativePanelExpanded.set_style_class_name('menu-operative-box');
   },

   loadAccessible: function() {
      this.operativePanel.add(this.categoriesWrapper, { x_fill: true, y_fill: true, expand: false });
      this.applicationsScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.applicationsBox, true, St.Align.START);
      this.changeTopBox.add(this.searchBox, {x_fill: true, x_align: St.Align.END, y_align: St.Align.END, y_fill: false, expand: false });
      this.favoritesObj = new MenuBox.FavoritesBoxExtended(this, true, this.favoritesLinesNumber);
      this.categoriesScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.categoriesBox, true, St.Align.START);
      this.favoritesScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.favoritesBox, true, St.Align.START);
      this.favBoxWrapper.add(this.favoritesScrollBox.actor, { y_fill: false, y_align: St.Align.START, expand: true });
      this.categoriesWrapper.add(this.categoriesScrollBox.actor, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.categoriesWrapper.add(this.categoriesSpaceDown, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.accessibleBox = new MenuBox.AccessibleBox(this, this.hover, this.selectedAppBox, this.controlView, this.powerBox, false, this.iconAccessibleSize, this.showRemovable);
      this.accessibleBox.actor.connect('key-press-event', Lang.bind(this, this._onMenuKeyPress));
      this.standardBox.add(this.rightPane, { span: 2, x_fill: true, expand: true });
      this.rightPane.add_actor(this.separatorTop.actor);
      this.betterPanel.add(this.operativePanel, { x_fill: true, y_fill: true, y_align: St.Align.START, expand: true });
      this.betterPanel.add(this.favBoxWrapper, { y_align: St.Align.MIDDLE, y_fill: true, expand: false });
      this.mainBox.add(this.accessibleBox.actor, { y_fill: true, expand: false });
      this.mainBox.add(this.extendedBox, { x_fill: true, y_fill: true, y_align: St.Align.START, expand: true });
      this.extendedBox.add(this.endVerticalBox, { x_fill: true, y_fill: false, y_align: St.Align.END, expand: false });
      this.endHorizontalBox.add(this.selectedAppBox.actor, { x_fill: true, y_fill: false, x_align: St.Align.END, y_align: St.Align.MIDDLE, expand: true });
      this.endVerticalBox.add_actor(this.separatorBottom.actor);
      this.endVerticalBox.add(this.endBox, { x_fill: true, y_fill: false, y_align: St.Align.END, expand: false });
      this.bottomBoxSwaper.add(this.endHorizontalBox, { x_fill: true, y_fill: true, expand: true });
      this.bottomBoxSwaper.add_actor(this.changeBottomBox);
      this.operativePanel.add(this.applicationsScrollBox.actor, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.operativePanel.set_style_class_name('menu-operative-box');
   },

   loadAccessibleInverted: function() {
      this.operativePanel.add(this.categoriesWrapper, { x_fill: true, y_fill: true, expand: false });
      this.applicationsScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.applicationsBox, true, St.Align.START);
      this.changeTopBox.add(this.searchBox, {x_fill: true, x_align: St.Align.END, y_align: St.Align.END, y_fill: false, expand: false });
      this.favoritesObj = new MenuBox.FavoritesBoxExtended(this, true, this.favoritesLinesNumber);
      this.categoriesScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.categoriesBox, true, St.Align.START);
      this.favoritesScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.favoritesBox, true, St.Align.START);
      this.favBoxWrapper.add(this.favoritesScrollBox.actor, { y_fill: false, y_align: St.Align.START, expand: true });
      this.categoriesWrapper.add(this.categoriesScrollBox.actor, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.categoriesWrapper.add(this.categoriesSpaceDown, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.accessibleBox = new MenuBox.AccessibleBox(this, this.hover, this.selectedAppBox, this.controlView, this.powerBox, false, this.iconAccessibleSize, this.showRemovable);
      this.accessibleBox.actor.connect('key-press-event', Lang.bind(this, this._onMenuKeyPress));
      this.standardBox.add(this.rightPane, { span: 2, x_fill: true, expand: true });
      this.rightPane.add_actor(this.separatorTop.actor);
      this.betterPanel.add(this.favBoxWrapper, { y_align: St.Align.MIDDLE, y_fill: true, expand: false });
      this.betterPanel.add(this.operativePanel, { x_fill: true, y_fill: true, y_align: St.Align.START, expand: true });
      this.mainBox.add(this.extendedBox, { x_fill: true, y_fill: true, y_align: St.Align.START, expand: true });
      this.mainBox.add(this.accessibleBox.actor, { y_fill: true });
      this.extendedBox.add(this.endVerticalBox, { x_fill: true, y_fill: false, y_align: St.Align.END, expand: false });
      this.endHorizontalBox.add(this.selectedAppBox.actor, { x_fill: true, y_fill: false, x_align: St.Align.END, y_align: St.Align.MIDDLE, expand: true });
      this.endVerticalBox.add_actor(this.separatorBottom.actor);
      this.endVerticalBox.add(this.endBox, { x_fill: true, y_fill: false, y_align: St.Align.END, expand: false });
      this.bottomBoxSwaper.add(this.endHorizontalBox, { x_fill: true, y_fill: true, expand: true });
      this.bottomBoxSwaper.add_actor(this.changeBottomBox);
      this.operativePanel.add(this.applicationsScrollBox.actor, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.operativePanel.set_style_class_name('menu-operative-box');
   },

   loadMint: function() {
      this.allowFavName = true;
      this.operativePanel.add(this.categoriesWrapper, { x_fill: true, y_fill: true, expand: false });
      this.applicationsScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.applicationsBox, true, St.Align.START);
      this.changeTopBox.add(this.panelAppsName, {x_fill: false, y_fill: false, x_align: St.Align.START, y_align: St.Align.MIDDLE, expand: true });
      this.bttChanger = new MenuBox.ButtonChangerBox(this, "forward", 20, [_("All Applications"), _("Favorites")], 0, Lang.bind(this, this._onPanelMintChange));
      this.bttChanger.setTheme(this.theme);
      this.bttChanger.actor.connect('key-press-event', Lang.bind(this, this._onMenuKeyPress));
      this.topBoxSwaper.add(this.bttChanger.actor, {x_fill: false, x_align: St.Align.END, y_align: St.Align.START, expand: true });
      this.favoritesObj = new MenuBox.FavoritesBoxExtended(this, true, this.favoritesLinesNumber);
      this.categoriesScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.categoriesBox, true, St.Align.START);
      this.favoritesScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.favoritesBox, true, St.Align.MIDDLE);
      this.favBoxWrapper.add(this.favoritesScrollBox.actor, { x_fill: true, y_fill: true, y_align: St.Align.START, expand: true });
      this.categoriesWrapper.add(this.categoriesScrollBox.actor, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.categoriesWrapper.add(this.categoriesSpaceDown, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.accessibleBox = new MenuBox.AccessibleBox(this, this.hover, this.selectedAppBox, this.controlView, this.powerBox, false, this.iconAccessibleSize, this.showRemovable);
      this.accessibleBox.actor.connect('key-press-event', Lang.bind(this, this._onMenuKeyPress));
      this.standardBox.add(this.rightPane, { x_fill: true, y_fill: true, expand: true });
      this.betterPanel.set_vertical(true);
      this.betterPanel.add_actor(this.separatorTop.actor);
      this.betterPanel.add(this.operativePanelExpanded, { x_fill: true, y_fill: true, y_align: St.Align.MIDDLE, expand: true });
      this.betterPanel.add_actor(this.separatorBottom.actor);
      this.operativePanelExpanded.add(this.favBoxWrapper, { x_fill: true, y_fill: true, y_align: St.Align.START, expand: true });
      this.operativePanelExpanded.add(this.operativePanel, { x_fill: true, y_fill: true, y_align: St.Align.START, expand: true });
      this.operativePanel.visible = false;
      this.mainBox.add(this.accessibleBox.actor, { y_fill: true });
      this.mainBox.add(this.extendedBox, { x_fill: true, y_fill: true, y_align: St.Align.START, expand: true });
      this.extendedBox.add(this.endVerticalBox, { x_fill: true, y_fill: false, y_align: St.Align.END, expand: false });
      this.endVerticalBox.add(this.endBox, { x_fill: true, y_fill: false, y_align: St.Align.END, expand: false });
      this.bottomBoxSwaper.add(this.endHorizontalBox, { x_fill: true, y_fill: true, expand: true });
      this.bottomBoxSwaper.add_actor(this.changeBottomBox);
      this.endHorizontalBox.add(this.searchBox, {x_fill: true, x_align: St.Align.END, y_align: St.Align.END, y_fill: false, expand: false });
      this.endHorizontalBox.add(this.selectedAppBox.actor, { x_fill: true, y_fill: false, x_align: St.Align.END, y_align: St.Align.MIDDLE, expand: true });
      this.operativePanel.add(this.applicationsScrollBox.actor, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.accessibleBox.setNamesVisible(true);
      this.searchName.visible = true;
      this.panelAppsName.visible = true;
      this.favBoxWrapper.set_style_class_name('menu-favorites-box-mint');
      this.operativePanelExpanded.set_style_class_name('menu-favorites-box');
      this.operativePanelExpanded.add_style_class_name('menu-operative-mint-box');
      this.selectedAppBox.actor.set_style('padding-right: 0px; padding-left: 4px; text-align: right');
   },

   loadWindows: function() {
      this.allowFavName = true;
      this.operativePanel.add(this.categoriesWrapper, { x_fill: true, y_fill: true, expand: false });
      this.applicationsScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.applicationsBox, true, St.Align.START);
      this.bttChanger = new MenuBox.ButtonChangerBox(this, "forward", 20, [_("All Applications"), _("Favorites")], 0, Lang.bind(this, this._onPanelWindowsChange));
      this.bttChanger.setTheme(this.theme);
      this.bttChanger.actor.connect('key-press-event', Lang.bind(this, this._onMenuKeyPress));
      this.favoritesObj = new MenuBox.FavoritesBoxExtended(this, true, this.favoritesLinesNumber);
      this.categoriesScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.categoriesBox, true, St.Align.START);
      this.favoritesScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.favoritesBox, true, St.Align.MIDDLE);
      this.favBoxWrapper.add(this.favoritesScrollBox.actor, { x_fill: true, y_fill: true, y_align: St.Align.START, expand: true });
      this.operativePanelExpanded.add(this.favBoxWrapper, { x_fill: true, y_fill: true, y_align: St.Align.START, expand: true });
      this.categoriesWrapper.add(this.categoriesScrollBox.actor, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.categoriesWrapper.add(this.categoriesSpaceDown, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.accessibleBox = new MenuBox.AccessibleBox(this, this.hover, this.selectedAppBox, this.controlView, this.powerBox, false, this.iconAccessibleSize, this.showRemovable);
      this.accessibleBox.actor.connect('key-press-event', Lang.bind(this, this._onMenuKeyPress));
      this.topBoxSwaper.add(this.selectedAppBox.actor, { x_fill: true, y_fill: false, x_align: St.Align.END, y_align: St.Align.MIDDLE, expand: true });
      this.standardBox.add(this.rightPane, { x_fill: true, y_fill: true, expand: true });
      this.betterPanel.set_vertical(true);
      this.betterPanel.add_actor(this.separatorTop.actor);
      this.betterPanel.add(this.operativePanelExpanded, { x_fill: true, y_fill: true, y_align: St.Align.MIDDLE, expand: true });
      this.betterPanel.add_actor(this.separatorBottom.actor);
      this.operativePanelExpanded.add(this.operativePanel, { x_fill: true, y_fill: true, y_align: St.Align.START, expand: true });
      this.changeBottomBoxUp.add(this.bttChanger.actor, { x_fill: false, x_align: St.Align.START, y_align: St.Align.START, expand: false });
      this.changeBottomBoxDown.add(this.searchBox, { x_fill: false, y_fill: false, x_align: St.Align.START, y_align: St.Align.END, expand: false });
      this.betterPanel.add(this.endBox, { x_fill: true, y_fill: true, y_align: St.Align.END, expand: false });
      this.endVerticalBox.add(this.changeBottomBox, { x_fill: true, y_fill: true, expand: true });
      this.endHorizontalBox.add(this.endVerticalBox, { x_fill: true, y_fill: true, expand: true });
      this.bottomBoxSwaper.add(this.endHorizontalBox, { x_fill: true, y_fill: true, expand: true });
      this.operativePanel.visible = false;
      this.mainBox.add(this.extendedBox, { x_fill: true, y_fill: true, y_align: St.Align.START, expand: true });
      this.mainBox.add(this.accessibleBox.actor, { y_fill: true });
      this.operativePanel.add(this.applicationsScrollBox.actor, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.favBoxWrapper.set_style_class_name('menu-favorites-box-windows7');
      this.rightPane.set_style_class_name('menu-favorites-box');
      this.rightPane.add_style_class_name('menu-swap-windows-box');
      this.operativePanelExpanded.set_style_class_name('menu-operative-windows-box');
   },

   loadGnoMenuLeft: function() {
      this.allowFavName = true;
      this.operativePanel.add(this.categoriesWrapper, { x_fill: true, y_fill: true, expand: false });
      this.applicationsScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.applicationsBox, true, St.Align.START);
      this.changeTopBox.add(this.controlView.actor, {x_fill: true, y_fill: false, x_align: St.Align.START, y_align: St.Align.MIDDLE, expand: true });
      this.topBoxSwaper.add(this.hover.container, {x_fill: false, x_align: St.Align.END, y_align: St.Align.MIDDLE, expand: true });
      this.favoritesObj = new MenuBox.FavoritesBoxExtended(this, true, this.favoritesLinesNumber);
      this.categoriesScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.categoriesBox, true, St.Align.START);
      this.categoriesScrollBox.actor.visible = false;
      this.favoritesScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.favoritesBox, true, St.Align.MIDDLE);
      this.favBoxWrapper.add(this.favoritesScrollBox.actor, { x_fill: true, y_fill: false, y_align: St.Align.START, expand: true });
      this.categoriesWrapper.add(this.categoriesScrollBox.actor, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.endHorizontalBox.add(this.selectedAppBox.actor, { x_fill: true, y_fill: false, x_align: St.Align.START, y_align: St.Align.MIDDLE, expand: true });
      this.betterPanel.add(this.operativePanelExpanded, { y_align: St.Align.MIDDLE, x_fill: true, y_fill: true, expand: false });
      this.standardBox.add(this.rightPane, { span: 2, x_fill: true, expand: true });
      this.rightPane.add_actor(this.separatorTop.actor);
      this.styleGnoMenuPanel = new St.BoxLayout({ style_class: 'menu-gno-operative-box-left', vertical: true });
      this.styleGnoMenuPanel.add(this.operativePanel, { x_fill: true, y_fill: false, y_align: St.Align.START, expand: true });
      this.styleGnoMenuPanel.add(this.favBoxWrapper, { x_fill: true, y_fill: false, y_align: St.Align.START, expand: true });
      this.betterPanel.add(this.styleGnoMenuPanel, { x_fill: true, y_fill: true, y_align: St.Align.START, expand: true });
      this.mainBox.add(this.extendedBox, { x_fill: true, y_fill: true, y_align: St.Align.START, expand: true });
      this.extendedBox.add_actor(this.separatorBottom.actor);
      this.extendedBox.add(this.endBox, { x_fill: true, y_fill: false, y_align: St.Align.END, expand: false });
      this.gnoMenuBox = new MenuBox.GnoMenuBox(this, this.hover, this.selectedAppBox, this.powerBox, true, this.iconAccessibleSize, Lang.bind(this, this._onPanelGnoMenuChange));
      this.gnoMenuBox.actor.connect('key-press-event', Lang.bind(this, this._onMenuKeyPress));
      this.operativePanelExpanded.add(this.gnoMenuBox.actor, { y_fill: true, x_align: St.Align.MIDDLE, y_align: St.Align.START, expand: true });
      this.changeBottomBoxUp.add(this.searchBox, { x_fill: true, y_fill: true, expand: true });
      this.changeBottomBoxDown.add(this.endHorizontalBox, { x_fill: true, y_fill: true, expand: true });
      this.endVerticalBox.add(this.changeBottomBox, { x_fill: true, y_fill: true, expand: true });
      this.bottomBoxSwaper.add(this.endVerticalBox, { x_fill: true, y_fill: true, expand: true });
      this.selectedAppBox.setAlign(St.Align.START);
      this.operativePanel.add(this.applicationsScrollBox.actor, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.operativePanel.visible = false;
      this.favoritesBox.set_style_class_name('menu-applications-box');
      this.favoritesBox.add_style_class_name('menu-favorites-box-internal');
      this.favoritesBox.add_style_class_name('menu-favorites-box-internal-gnomenuLeft');
      this.favBoxWrapper.set_style_class_name('menu-favorites-box-gnomenuLeft');
      this.selectedAppBox.actor.set_style('padding-left: 0px; text-align: left');
   },

   loadGnoMenuRight: function() {
      this.allowFavName = true;
      this.operativePanel.add(this.categoriesWrapper, { x_fill: true, y_fill: true, expand: false });
      this.applicationsScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.applicationsBox, true, St.Align.START);
      this.changeTopBox.add(this.controlView.actor, {x_fill: true, y_fill: false, x_align: St.Align.START, y_align: St.Align.MIDDLE, expand: true });
      this.topBoxSwaper.add(this.hover.container, {x_fill: false, x_align: St.Align.END, y_align: St.Align.MIDDLE, expand: true });
      this.favoritesObj = new MenuBox.FavoritesBoxExtended(this, true, this.favoritesLinesNumber);
      this.categoriesScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.categoriesBox, true, St.Align.START);
      this.categoriesScrollBox.actor.visible = false;
      this.favoritesScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.favoritesBox, true, St.Align.MIDDLE);
      this.favBoxWrapper.add(this.favoritesScrollBox.actor, { x_fill: true, y_fill: false, y_align: St.Align.START, expand: true });
      this.categoriesWrapper.add(this.categoriesScrollBox.actor, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.endHorizontalBox.add(this.selectedAppBox.actor, { x_fill: true, y_fill: false, x_align: St.Align.START, y_align: St.Align.MIDDLE, expand: true });
      this.standardBox.add(this.rightPane, { span: 2, x_fill: true, expand: true });
      this.rightPane.add_actor(this.separatorTop.actor);
      this.styleGnoMenuPanel = new St.BoxLayout({ style_class: 'menu-gno-operative-box-right', vertical: true });
      this.styleGnoMenuPanel.add(this.operativePanel, { x_fill: true, y_fill: false, y_align: St.Align.START, expand: true });
      this.styleGnoMenuPanel.add(this.favBoxWrapper, { x_fill: true, y_fill: false, y_align: St.Align.START, expand: true });
      this.betterPanel.add(this.styleGnoMenuPanel, { x_fill: true, y_fill: true, y_align: St.Align.START, expand: true });
      this.betterPanel.add(this.operativePanelExpanded, { y_align: St.Align.MIDDLE, x_fill: true, y_fill: true, expand: false });
      this.mainBox.add(this.extendedBox, { x_fill: true, y_fill: true, y_align: St.Align.START, expand: true });
      this.extendedBox.add_actor(this.separatorBottom.actor);
      this.extendedBox.add(this.endBox, { x_fill: true, y_fill: false, y_align: St.Align.END, expand: false });
      this.gnoMenuBox = new MenuBox.GnoMenuBox(this, this.hover, this.selectedAppBox, this.powerBox, true, this.iconAccessibleSize, Lang.bind(this, this._onPanelGnoMenuChange));
      this.gnoMenuBox.actor.connect('key-press-event', Lang.bind(this, this._onMenuKeyPress));
      this.operativePanelExpanded.add(this.gnoMenuBox.actor, { y_fill: true, x_align: St.Align.MIDDLE, y_align: St.Align.START, expand: true });
      this.changeBottomBoxUp.add(this.searchBox, { x_fill: true, y_fill: true, expand: true });
      this.changeBottomBoxDown.add(this.endHorizontalBox, { x_fill: true, y_fill: true, expand: true });
      this.endVerticalBox.add(this.changeBottomBox, { x_fill: true, y_fill: true, expand: true });
      this.bottomBoxSwaper.add(this.endVerticalBox, { x_fill: true, y_fill: true, expand: true });
      this.selectedAppBox.setAlign(St.Align.START);
      this.operativePanel.add(this.applicationsScrollBox.actor, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.operativePanel.visible = false;
      this.favoritesBox.set_style_class_name('menu-applications-box');
      this.favoritesBox.add_style_class_name('menu-favorites-box-internal');
      this.favoritesBox.add_style_class_name('menu-favorites-box-internal-gnomenuRight');
      this.favBoxWrapper.set_style_class_name('menu-favorites-box-gnomenuRight');
      this.selectedAppBox.actor.set_style('padding-left: 0px; text-align: left');
   },

   loadGnoMenuTop: function() {
      this.allowFavName = true;
      this.operativePanel.add(this.categoriesWrapper, { x_fill: true, y_fill: true, expand: false });
      this.applicationsScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.applicationsBox, true, St.Align.START);
      this.changeTopBox.add(this.controlView.actor, {x_fill: true, y_fill: false, x_align: St.Align.START, y_align: St.Align.MIDDLE, expand: true });
      this.topBoxSwaper.add(this.hover.container, {x_fill: false, x_align: St.Align.END, y_align: St.Align.MIDDLE, expand: true });
      this.favoritesObj = new MenuBox.FavoritesBoxExtended(this, true, this.favoritesLinesNumber);
      this.categoriesScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.categoriesBox, true, St.Align.START);
      this.categoriesScrollBox.actor.visible = false;
      this.favoritesScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.favoritesBox, true, St.Align.MIDDLE);
      this.favBoxWrapper.add(this.favoritesScrollBox.actor, { x_fill: true, y_fill: false, y_align: St.Align.START, expand: true });
      this.categoriesWrapper.add(this.categoriesScrollBox.actor, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.standardBox.add(this.rightPane, { span: 2, x_fill: true, expand: true });
      this.styleGnoMenuPanel = new St.BoxLayout({ style_class: 'menu-gno-operative-box-top', vertical: true });
      this.styleGnoMenuPanel.add(this.operativePanel, { x_fill: true, y_fill: false, y_align: St.Align.START, expand: true });
      this.styleGnoMenuPanel.add(this.favBoxWrapper, { x_fill: true, y_fill: false, y_align: St.Align.START, expand: true });
      this.betterPanel.add(this.styleGnoMenuPanel, { x_fill: true, y_fill: true, y_align: St.Align.START, expand: true });
      this.gnoMenuBox = new MenuBox.GnoMenuBox(this, this.hover, this.selectedAppBox, this.powerBox, false, this.iconAccessibleSize, Lang.bind(this, this._onPanelGnoMenuChange));
      this.gnoMenuBox.actor.connect('key-press-event', Lang.bind(this, this._onMenuKeyPress));
      this.rightPane.add_actor(this.separatorTop.actor);
      this.rightPane.add_actor(this.gnoMenuBox.actor);
      this.rightPane.add_actor(this.separatorMiddle.actor);
      this.mainBox.add(this.extendedBox, { x_fill: true, y_fill: true, y_align: St.Align.START, expand: true });
      this.extendedBox.add_actor(this.separatorBottom.actor);
      this.extendedBox.add(this.endBox, { x_fill: true, y_fill: false, y_align: St.Align.END, expand: false });
      this.endHorizontalBox.add_actor(this.searchBox);
      this.endHorizontalBox.add(this.selectedAppBox.actor, { x_fill: true, y_fill: false, x_align: St.Align.START, y_align: St.Align.MIDDLE, expand: true });
      this.endVerticalBox.add(this.endHorizontalBox, { x_fill: true, y_fill: true, expand: true });
      this.bottomBoxSwaper.add(this.endVerticalBox, { x_fill: true, y_fill: true, expand: true });
      this.bottomBoxSwaper.add_actor(this.changeBottomBox);
      this.selectedAppBox.setAlign(St.Align.START);
      this.operativePanel.add(this.applicationsScrollBox.actor, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.operativePanel.visible = false;
      this.favoritesBox.set_style_class_name('menu-applications-box');
      this.favoritesBox.add_style_class_name('menu-favorites-box-internal');
      this.favoritesBox.add_style_class_name('menu-favorites-box-internal-gnomenuTop');
      this.favBoxWrapper.set_style_class_name('menu-favorites-box-gnomenuTop');
   },

   loadGnoMenuBottom: function() {
      this.allowFavName = true;
      this.operativePanel.add(this.categoriesWrapper, { x_fill: true, y_fill: true, expand: false });
      this.applicationsScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.applicationsBox, true, St.Align.START);
      this.changeTopBox.add(this.controlView.actor, {x_fill: true, y_fill: false, x_align: St.Align.START, y_align: St.Align.MIDDLE, expand: true });
      this.topBoxSwaper.add(this.hover.container, {x_fill: false, x_align: St.Align.END, y_align: St.Align.MIDDLE, expand: true });
      this.favoritesObj = new MenuBox.FavoritesBoxExtended(this, true, this.favoritesLinesNumber);
      this.categoriesScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.categoriesBox, true, St.Align.START);
      this.categoriesScrollBox.actor.visible = false;
      this.favoritesScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.favoritesBox, true, St.Align.MIDDLE);
      this.favBoxWrapper.add(this.favoritesScrollBox.actor, { x_fill: true, y_fill: false, y_align: St.Align.START, expand: true });
      this.categoriesWrapper.add(this.categoriesScrollBox.actor, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.standardBox.add(this.rightPane, { span: 2, x_fill: true, expand: true });
      this.styleGnoMenuPanel = new St.BoxLayout({ style_class: 'menu-gno-operative-box-bottom', vertical: true });
      this.styleGnoMenuPanel.add(this.operativePanel, { x_fill: true, y_fill: false, y_align: St.Align.START, expand: true });
      this.styleGnoMenuPanel.add(this.favBoxWrapper, { x_fill: true, y_fill: false, y_align: St.Align.START, expand: true });
      this.gnoMenuBox = new MenuBox.GnoMenuBox(this, this.hover, this.selectedAppBox, this.powerBox, false, this.iconAccessibleSize, Lang.bind(this, this._onPanelGnoMenuChange));
      this.gnoMenuBox.actor.connect('key-press-event', Lang.bind(this, this._onMenuKeyPress));
      this.rightPane.add_actor(this.separatorTop.actor);
      this.rightPane.add(this.styleGnoMenuPanel, { x_fill: true, y_fill: true, y_align: St.Align.START, expand: true });
      this.mainBox.add(this.extendedBox, { x_fill: true, y_fill: true, y_align: St.Align.START, expand: true });
      this.extendedBox.add_actor(this.separatorMiddle.actor);
      this.extendedBox.add_actor(this.gnoMenuBox.actor);
      this.extendedBox.add_actor(this.separatorBottom.actor);
      this.extendedBox.add(this.endBox, { x_fill: true, y_fill: false, y_align: St.Align.END, expand: false });
      this.endHorizontalBox.add_actor(this.searchBox);
      this.endHorizontalBox.add(this.selectedAppBox.actor, { x_fill: true, y_fill: false, x_align: St.Align.START, y_align: St.Align.MIDDLE, expand: true });
      this.endVerticalBox.add(this.endHorizontalBox, { x_fill: true, y_fill: true, expand: true });
      this.bottomBoxSwaper.add(this.endVerticalBox, { x_fill: true, y_fill: true, expand: true });
      this.bottomBoxSwaper.add_actor(this.changeBottomBox);
      this.selectedAppBox.setAlign(St.Align.START);
      this.operativePanel.add(this.applicationsScrollBox.actor, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.operativePanel.visible = false;
      this.favoritesBox.set_style_class_name('menu-applications-box');
      this.favoritesBox.add_style_class_name('menu-favorites-box-internal');
      this.favoritesBox.add_style_class_name('menu-favorites-box-internal-gnomenuBottom');
      this.favBoxWrapper.set_style_class_name('menu-favorites-box-gnomenuBottom');
   },

   _onPanelGnoMenuChange: function(selected) {
      this._activeContainer = null;
      if(selected == _("Favorites")) {
         this.operativePanel.visible = false;
         this.favoritesScrollBox.actor.visible = true;
         this.favBoxWrapper.visible = true;
      } else {
         this.favoritesScrollBox.actor.visible = false;
         this.favBoxWrapper.visible = false;
         this.operativePanel.visible = true;
         let selectedButton;
         if(selected == _("All Applications"))
            selectedButton = this._allAppsCategoryButton;
         else if(selected == _("Places"))
            selectedButton = this.placesButton;
         else if(selected == _("Recent Files"))
            selectedButton = this.recentButton;
         if(selectedButton) {
            this._clearPrevCatSelection(selectedButton.actor);
            selectedButton.actor.set_style_class_name('menu-category-button-selected');
            selectedButton.actor.add_style_class_name('menu-category-button-selected-' + this.theme);
            if(selected == _("All Applications"))
               this._select_category(null, selectedButton);
            else if(selected == _("Places"))
               this._displayButtons(null, -1);
            else if(selected == _("Recent Files"))
               this._displayButtons(null, null, -1);
            this._activeContainer = this.categoriesBox;
            //global.stage.set_key_focus(this.searchEntry);
         }
      }
      let minWidth = this._minimalWidth();
      if(this.width < minWidth) {
         this._updateSize();
      }
   },

   _onPanelMintChange: function(selected) {
      global.stage.set_key_focus(this.searchEntry);
      let operPanelVisible = false;
      let titleAppBar = _("All Applications");
      if(titleAppBar == selected) {
         this.panelAppsName.set_text(_("Favorites"));
         operPanelVisible = true;
      } else {
         this.panelAppsName.set_text(_("All Applications"));
      }
      this.operativePanel.visible = !operPanelVisible;
      this.favoritesScrollBox.actor.visible = operPanelVisible;
      this.favBoxWrapper.visible = operPanelVisible;
      //this._activeContainer = null;
      let minWidth = this._minimalWidth();
      if(this.width < minWidth)
         this._updateSize();
   },

   _onPanelWindowsChange: function(selected) {
      global.stage.set_key_focus(this.searchEntry);
      let operPanelVisible = false;
      let titleAppBar = _("All Applications");
      if(titleAppBar == selected) {
         this.accessibleBox.takeHover(true);
         operPanelVisible = true;
      }
      else {
         this.accessibleBox.takeHover(false);
         this.topBoxSwaper.add_actor(this.hover.container);
      }
      this.powerBox.actor.visible = operPanelVisible;
      //this.hover.actor.visible = operPanelVisible;
      //this.hover.container.visible = operPanelVisible;
      if(this.accessibleBox)
         this.accessibleBox.hoverBox.visible = this.showHoverIcon;
      this.accessibleBox.actor.visible = operPanelVisible;
      this.operativePanel.visible = !operPanelVisible;
      this.favBoxWrapper.visible = operPanelVisible;
      this.favoritesScrollBox.actor.visible = operPanelVisible;
      this.favBoxWrapper.visible = operPanelVisible;
      //this._activeContainer = null;
      let minWidth = this._minimalWidth();
      if(this.width < minWidth)
         this._updateSize();
   },

   loadClassicGnome: function() {
      this._appletGenerateGnomeMenu(true);
      this.menuGnomeMainBox = new St.BoxLayout();
      let section = new PopupMenu.PopupMenuSection();
      this.appMenu.addMenuItem(section);
      section.actor.add_actor(this.menuGnomeMainBox);
      this.menuGnomeMainBox.add(this.operativePanel, { x_fill: true, y_fill: false, x_align: St.Align.START, y_align: St.Align.START, expand: true });

      this.allowFavName = true;
      this.betterPanel.set_vertical(true);
      this.changeTopBoxDown.set_vertical(true);
      //this.selectedAppBox.setAlign(St.Align.START);

      this.applicationsScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.applicationsBox, true, St.Align.START);
      this.placesScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.placesBox, true, St.Align.START);
      this.placesObj = new MenuBox.PlacesGnomeBox(this, this.selectedAppBox, this.hover, 22, this.iconView, this.placesScrollBox, this.textButtonWidth);
      this.placesBox.add_actor(this.placesObj.actor);
      this.categoriesScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.categoriesBox, true, St.Align.START);
      this.favoritesScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.favoritesBox, true, St.Align.START);
      this.favoritesObj = new MenuBox.FavoritesBoxExtended(this, true, this.favoritesLinesNumber);
      this.favBoxWrapper.add(this.favoritesScrollBox.actor, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});

      this.mainBox.add(this.extendedBox, { x_fill: true, y_fill: true, y_align: St.Align.START, expand: true });
      this.standardBox.add(this.rightPane, { x_fill: true, y_fill: true, expand: true });

      this.categoriesWrapper.add(this.placesScrollBox.actor, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.categoriesWrapper.add(this.categoriesScrollBox.actor, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.categoriesWrapper.add(this.favBoxWrapper, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.categoriesWrapper.add(this.categoriesSpaceDown, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      
      this.categoriesWrapper.add_actor(this.separatorMiddle.actor);
      this.categoriesWrapper.add_actor(this.separatorBottom.actor);

      this.changeTopBoxUp.add(this.hover.container, {x_fill: false, y_fill: false, x_align: St.Align.START, y_align: St.Align.MIDDLE, expand: false });
      this.changeTopBoxUp.add(this.selectedAppBox.actor, { x_fill: true, y_fill: false, x_align: St.Align.END, y_align: St.Align.MIDDLE, expand: true });
      this.changeTopBoxDown.add(this.searchBox, {x_fill: true, y_fill: false, x_align: St.Align.START, y_align: St.Align.MIDDLE, expand: true });
      this.changeTopBoxDown.add(this.controlView.actor, {x_fill: true, y_fill: false, x_align: St.Align.START, y_align: St.Align.MIDDLE, expand: true });

      
      this.betterPanel.add_actor(this.separatorTop.actor);
      this.betterPanel.add(this.categoriesWrapper, { x_fill: true, y_fill: true, expand: false });

      this.endHorizontalBox.add(this.endVerticalBox, { x_fill: true, y_fill: true, expand: true });
      this.bottomBoxSwaper.add(this.endHorizontalBox, { x_fill: true, y_fill: true, expand: true });
      this.bottomBoxSwaper.add_actor(this.changeBottomBox);
      this.betterPanel.add(this.endBox, { x_fill: true, y_fill: true, y_align: St.Align.END, expand: false });
      this.endVerticalBox.add(this.powerBox.actor, { x_fill: true, y_fill: true, expand: false });
      this.operativePanel.add(this.applicationsScrollBox.actor, { x_fill: true, y_fill: true, x_align: St.Align.START, expand: true });

      this.favBoxWrapper.set_style_class_name('menu-favorites-box-classicGnome');

      //this.searchEntry.visible = false;
      //this.operativePanel.visible = true;
      this.powerBox.actor.visible = false;
      this.endVerticalBox.visible = false;
     // this.controlView.actor.visible = false;
      this.searchEntry.set_width(200);
   },

   loadKicker: function() {
      this._appletGenerateApplicationMenu(true);
      this.menuGnomeMainBox = new St.BoxLayout();
      let section = new PopupMenu.PopupMenuSection();
      this.appMenu.addMenuItem(section);
      section.actor.add_actor(this.menuGnomeMainBox);
      this.menuGnomeMainBox.add(this.operativePanel, { x_fill: true, y_fill: false, x_align: St.Align.START, y_align: St.Align.START, expand: true });

      this.betterPanel.set_vertical(true);
      this.changeTopBoxDown.set_vertical(true);
      this.betterPanel.add(this.categoriesWrapper, { x_fill: true, y_fill: true, y_align: St.Align.START, expand: true });
      this.applicationsScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.applicationsBox, true, St.Align.START);

      this.topBoxSwaper.add(this.hover.container, {x_fill: false, y_fill: false, x_align: St.Align.END, y_align: St.Align.START, expand: false });    
      this.changeTopBoxUp.add(this.selectedAppBox.actor, {x_fill: true, y_fill: false, x_align: St.Align.START, y_align: St.Align.START, expand: true });
      this.changeTopBoxDown.add(this.controlView.actor, { x_fill: true, y_fill: false, x_align: St.Align.START, y_align: St.Align.END, expand: true });

      this.favoritesObj = new MenuBox.FavoritesBoxExtended(this, true, this.favoritesLinesNumber);
      this.categoriesScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.categoriesBox, true, St.Align.START);
      this.favoritesScrollBox = new ConfigurableScrolls.ScrollItemsBox(this, this.favoritesBox, true, St.Align.START);
      this.favBoxWrapper.add(this.favoritesScrollBox.actor, { y_fill: false, y_align: St.Align.START, expand: true });
      this.categoriesWrapper.add(this.categoriesScrollBox.actor, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.betterPanel.add(this.endVerticalBox, {x_fill: true, y_fill: true, y_align: St.Align.END, expand: true});
      this.categoriesWrapper.add(this.categoriesSpaceDown, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true});
      this.operativePanelExpanded.add(this.favBoxWrapper, { x_fill: false, y_fill: false, y_align: St.Align.START, expand: false });
      this.operativePanelExpanded.add(this.powerBox.actor, { x_fill: false, y_fill: false, y_align: St.Align.END, expand: true });
      this.standardBox.add(this.operativePanelExpanded, { y_align: St.Align.END, y_fill: true, expand: false });
      this.standardBox.add(this.rightPane, { x_fill: true, y_fill: true, expand: true });
      Mainloop.idle_add(Lang.bind(this, function() {
         let [cx, cy] = this.actor.get_transformed_position();
         let monitor = Main.layoutManager.primaryMonitor;
         if(cx > (monitor.x + monitor.width/2)) {
            this.standardBox.remove_actor(this.operativePanelExpanded);
            this.standardBox.remove_actor(this.rightPane);
            this.standardBox.add(this.rightPane, { x_fill: true, y_fill: true, expand: true });
            this.standardBox.add(this.operativePanelExpanded, { y_align: St.Align.END, y_fill: true, expand: false });
         }
      }));
      this.rightPane.add_actor(this.separatorTop.actor);
      this.mainBox.add(this.extendedBox, { x_fill: true, y_fill: true, y_align: St.Align.START, expand: true });

      this.endVerticalBox.add(this.separatorBottom.actor, { x_fill: true, y_fill: false, y_align: St.Align.END, expand: true } );
      this.endVerticalBox.add_actor(this.endBox);
      this.changeBottomBoxUp.add(this.searchBox, {x_fill: true, y_fill: false, x_align: St.Align.START, y_align: St.Align.END, expand: true });
      this.bottomBoxSwaper.add(this.changeBottomBox, { x_fill: true, y_fill: false, y_align: St.Align.END, expand: true });
      this.bottomBoxSwaper.add(this.endHorizontalBox, { x_fill: true, y_fill: true, expand: false });
      //this.endBox.set_style_class_name('menu-favorites-box');
      this.operativePanel.add(this.applicationsScrollBox.actor, {x_fill: true, y_fill: true, y_align: St.Align.START, expand: true });
      this.operativePanel.set_style_class_name('menu-operative-box');
      this.searchEntry.set_width(200);
   },

   _appletGenerateGnomeMenu: function(generate) {
      try {
         if(this.appletMenu) {
            this.appletMenu.destroy();
            this.appletMenu = null;
            this.categoriesExcludes = null;
            this.categoriesIncludes = null;
            this.placesObj.actor.destroy();
            this.placesObj = null;
         }

         if(generate) {
            this.appletMenu = new ConfigurableMenus.ConfigurableAppletMenu(this);
            this.appletMenu.actor.connect('key-press-event', Lang.bind(this, this._onMenuKeyPress));
            let newGnomeCat = new MenuItems.GnomeCategoryButton(this, "Favorites", "", false, this.orientation, this._panelHeight);
            this.appletMenu.addCategory(newGnomeCat);
            newGnomeCat = new MenuItems.GnomeCategoryButton(this, "Places", "", false, this.orientation, this._panelHeight);
            this.appletMenu.addCategory(newGnomeCat);
            newGnomeCat = new MenuItems.GnomeCategoryButton(this, "System", "", false, this.orientation, this._panelHeight);
            this.appletMenu.addCategory(newGnomeCat);
            this.appletMenu.connectCategories('button-press-event', Lang.bind(this, this.onCategorieGnomeChange));
            this.appletMenu.connectCategories('enter-event', Lang.bind(this, this.onCategorieGnomeChange));
            this.placesBox = new St.BoxLayout({ vertical: true, style_class: 'menu-applications-box' });
            this.placesBox.add_style_class_name('menu-applications-box-' + this.theme);
            this.placesBox.set_style('padding: 0px; border-left: none; border-right: none; border-top: none; border-bottom: none;');
         }
         this._appletGenerateApplicationMenu(generate);
      } catch(e) {
         Main.notify("Gnome error", e.message);
      }
   },

   _appletGenerateApplicationMenu: function(generate) {
      try {
      if(this.appMenu) {
         this.appMenu.destroy();
         this.appMenu = null;
      }
      this.onEnterMenuGnome();
      if(generate) {
         this.menu.actor.connect('enter-event', Lang.bind(this, this.onEnterMenuGnome));
         this.menu.actor.connect('leave-event', Lang.bind(this, this.onLeaveMenuGnome));

         this.appMenu = new ConfigurablePopupMenu(this, this, this.orientation);
         this.appMenu.actor.connect('enter-event', Lang.bind(this, this.onEnterMenuGnome));
         this.appMenu.actor.connect('leave-event', Lang.bind(this, this.onLeaveMenuGnome));
         this.appMenu.showBoxPointer(this.showBoxPointer);
         this.appMenu.fixToCorner(this.fixMenuCorner);
         this.appMenu.actor.connect('motion-event', Lang.bind(this, this._onResizeMotionEvent));
         this.appMenu.actor.connect('button-press-event', Lang.bind(this, this._onMenuButtonPress));
         this.appMenu.actor.connect('leave-event', Lang.bind(this, this._disableOverResizeIcon));
         this.appMenu.actor.connect('button-release-event', Lang.bind(this, this._onMenuButtonRelease));

         this.menu.actor.set_style('padding: 0px; border-left: none; border-right: none; border-top: none; border-bottom: none;');
         this.menuBox.set_style('padding: 0px; border-left: none; border-right: none; border-top: none; border-bottom: none;');
         this.categoriesBox.set_style('padding: 0px; border-left: none; border-right: none; border-top: none; border-bottom: none;');
         this.favoritesBox.set_style('padding: 0px; border-left: none; border-right: none; border-top: none; border-bottom: none;');
      } else {
         this.menu.actor.set_style(' ');
         this.menu.box.set_style(' ');
         this.categoriesBox.set_style(' ');
         this.favoritesBox.set_style(' ');
      }
      } catch(e) {
         Main.notify("Application Menu error", e.message);
      }
   },

   excludeCategories: function() {
      if(this.categoriesIncludes) {
         for(let i = 0; i < this._categoryButtons.length; i++) {
            if(this.categoriesIncludes.indexOf(this._categoryButtons[i].getCategoryID()) != -1) {
               this._categoryButtons[i].actor.visible = true;
            } else {
               this._categoryButtons[i].actor.visible = false;
            }
         }
      } else if(this.categoriesExcludes) {
         for(let i = 0; i < this._categoryButtons.length; i++) {
            if(this.categoriesExcludes.indexOf(this._categoryButtons[i].getCategoryID()) != -1) {
               this._categoryButtons[i].actor.visible = false;
            } else {
               this._categoryButtons[i].actor.visible = true;
            }
         }
      }
   },

   repositionGnomeCategory: function() {
      if(this.appletMenu) {
         if(this.repositionActor) {
            this.onCategorieGnomeChange(this.repositionActor);
         } else {
            this.onCategorieGnomeChange(this.appletMenu.getActorForName("Main"));
         }
      }
   },

   openGnomeMenu: function(categoryActor) {
      if((this.appMenu)&&(this.displayed)&&(this.menu.isOpen)) {
         if(this._applet_context_menu.isOpen)
            this._applet_context_menu.close();
         this.appMenu.reparentMenu(this.menu, this.popupOrientation);
         if(!this.appMenu.isOpen) {
            //this.appMenu.actor
            this.appMenu.open();
         }
         if((categoryActor)&&(!this.subMenuAlign)) {
            this.appMenu.repositionActor(categoryActor);
            let [menu_x, menu_y] = this.menu.actor.get_transformed_position();
            let [menu_w, menu_h] = this.menu.actor.get_transformed_size();
            let [catbox_x, catbox_y] = this.categoriesBox.get_transformed_position();
            let [catbox_w, catbox_h] = this.categoriesBox.get_transformed_size();
            let size = 0;
            if(this.popupOrientation == St.Side.LEFT)
               size = menu_x + menu_w - (catbox_x + catbox_w);
            else
               size = menu_x - catbox_x;
            this.appMenu.shiftPosition(size, 0);
         } else {
            /*if(this.menu.sourceActor == this.appletMenu.getActorForName("Main"))
               this.appMenu.repositionActor(this._allAppsCategoryButton.actor);
            else*/
            this.appMenu.repositionActor(this.menu.actor);
            this.appMenu.shiftPosition(0, 0);
         }
         //this._updateSize();
         return true;
      }
      return false;
   },

   onCategorieGnomeChange: function(actor, event) {
      try {
         if(this.appletMenu) {
            if(this.menu.isOpen) {
               this.appMenuClose();
               if((event)&&((event.type() == Clutter.EventType.BUTTON_PRESS)||(event.type() == Clutter.EventType.BUTTON_RELEASE))) {
                  if((event.get_button() == 1)&&(this.repositionActor != actor))
                     return true;
               }
            }
            this.menu.repositionActor(actor);
            this._activeContainer = null;
            this.closeApplicationsContextMenus(false);
            //select the display;
            if(this.appletMenu.getActorForName("Main") == actor) {
               this._activeGnomeMenu(actor);
               //this.searchEntry.visible = true;
               //global.stage.set_key_focus(this.searchEntry);
               this.powerBox.actor.visible = false;
               this.endVerticalBox.visible = false;
               this.hover.actor.visible = this.showHoverIcon;
               this.hover.container.visible = this.showHoverIcon;
               this.favoritesScrollBox.actor.visible = false;
               this.favBoxWrapper.visible = false;
               this.controlView.actor.visible = false;
               this.categoriesScrollBox.actor.visible = true;
               this.placesScrollBox.actor.visible = false;
               this.categoriesIncludes = null;
               this.categoriesExcludes = new Array();
               this.categoriesExcludes.push("Places");
               this.categoriesExcludes.push("Recently");
               this.categoriesExcludes.push("Preferences");
               this.categoriesExcludes.push("Administration");
               this.excludeCategories();
            } else if(this.appletMenu.getActorForName("Favorites") == actor) {
               this._activeGnomeMenu(actor);
               //this.searchEntry.visible = false;
               this.categoriesIncludes = new Array();
               this.categoriesExcludes = null;
               this.hover.actor.visible = this.showHoverIcon;
               this.hover.container.visible = this.showHoverIcon;
               this.favoritesScrollBox.actor.visible = true;
               this.favBoxWrapper.visible = true;
               this.powerBox.actor.visible = false;
               this.endVerticalBox.visible = false;
               this.controlView.actor.visible = false;
               this.categoriesScrollBox.actor.visible = false;
               this.placesScrollBox.actor.visible = false;
               this.excludeCategories();
            } else if(this.appletMenu.getActorForName("Places") == actor) {
               this._activeGnomeMenu(actor);
               //this.searchEntry.visible = false;
               this.categoriesIncludes = new Array();
               if(this.RecentManager._infosByTimestamp.length != 0)
                  this.categoriesIncludes.push("Recently");
               this.powerBox.actor.visible = false;
               this.endVerticalBox.visible = false;
               this.hover.actor.visible = this.showHoverIcon;
               this.hover.container.visible = this.showHoverIcon;
               this.favoritesScrollBox.actor.visible = false;
               this.favBoxWrapper.visible = false;
               this.controlView.actor.visible = false;
               this.categoriesScrollBox.actor.visible = true;
               this.placesScrollBox.actor.visible = true;
               this.excludeCategories();
            } else if(this.appletMenu.getActorForName("System") == actor) {
               this._activeGnomeMenu(actor);
               //this.searchEntry.visible = false;
               this.categoriesIncludes = new Array();
               this.categoriesIncludes.push("Preferences");
               this.categoriesIncludes.push("Administration");
               this.powerBox.actor.visible = this.showPowerButtons;
               this.endVerticalBox.visible = true;
               this.hover.actor.visible = this.showHoverIcon;
               this.hover.container.visible = this.showHoverIcon;
               this.favoritesScrollBox.actor.visible = false;
               this.favBoxWrapper.visible = false;
               this.controlView.actor.visible = this.showView;
               this.categoriesScrollBox.actor.visible = true;
               this.placesScrollBox.actor.visible = false;
               this.excludeCategories();
            }
            if((this.menu.isOpen)&&(this.searchEntry.clutter_text.length > 0)) {
               this.appMenu.open();
            }
            this._updateSize();
            this.repositionActor = actor;
         }
      } catch(e) {
         Main.notify("Error repos", e.message);
      }

      return false;
   },

   appMenuClose: function() {
      if(this.appMenu) {
         if(this.appMenu.isOpen) {
            //this.lastActor = null;
            this.appMenu.close();
         }
      }
   },

   _activeGnomeMenu: function(actor) {
      if(this.appletMenu) {
         this.appletMenu.activeCategoryActor(actor);
      }
   },

   onLeaveMenuGnome: function() {
      if(!this.actorResize) {
         if(this.idWaitingGnome == 0) {
            this.idWaitingGnome = Mainloop.timeout_add(300, Lang.bind(this, function() {
               if(this.idWaitingGnome > 0) {
                  this.appMenuClose();
                  this.onEnterMenuGnome();
               }
            }));
         }
      }
   },

   onEnterMenuGnome: function() {
      if(this.idWaitingGnome > 0) {
         Mainloop.source_remove(this.idWaitingGnome);
         this.idWaitingGnome = 0;
      }
   },
   
   setPanelHeight: function(panel_height) {
      Applet.TextIconApplet.prototype.setPanelHeight.call(this, panel_height);
      if(this.appletMenu) {
         this.appletMenu.setPanelHeight(panel_height);
      }
   },

   _listBookmarks: function(pattern) {
       let bookmarks = Main.placesManager.getBookmarks();
       let special = this._listSpecialBookmarks();
       var res = new Array();
       for (let id = 0; id < special.length; id++) {
          if (!pattern || special[id].name.toLowerCase().indexOf(pattern)!=-1) res.push(special[id]);
       }
       for (let id = 0; id < bookmarks.length; id++) {
          if (!pattern || bookmarks[id].name.toLowerCase().indexOf(pattern)!=-1) res.push(bookmarks[id]);
       }
       return res;
   },

   _listSpecialBookmarks: function() {
      if(!this.specialBookmarks) {
         this.specialBookmarks = new Array();
         this.specialBookmarks.push(new SpecialBookmarks(_("Computer"), "computer", "computer:///"));
         this.specialBookmarks.push(new SpecialBookmarks(_("Home"), "user-home", GLib.get_home_dir()));
         this.specialBookmarks.push(new SpecialBookmarks(_("Desktop"), "emblem-desktop", USER_DESKTOP_PATH));
         this.specialBookmarks.push(new SpecialBookmarks(_("Networking"), "network", "network:///"));
         this.specialBookmarks.push(new SpecialBookmarks(_("Trash"), "user-trash", "trash:///"));
      }
      return this.specialBookmarks;
   },

   _listDevices: function(pattern){
      let devices = Main.placesManager.getMounts();
      let res = new Array();
      for(let id = 0; id < devices.length; id++) {
         if(!pattern || devices[id].name.toLowerCase().indexOf(pattern)!=-1) res.push(devices[id]);
      }
      return res;
   },

   _listApplications: function(category_menu_id, pattern){
      let applist = new Array();
      if(category_menu_id) {
         applist = category_menu_id;
      } else {
         applist = "all";
      }
      let res;
      if(pattern) {
         res = new Array();
         for(let i in this._applicationsButtons) {
            let app = this._applicationsButtons[i].app;
            if(app.get_name().toLowerCase().indexOf(pattern)!=-1 || (app.get_description() &&
               app.get_description().toLowerCase().indexOf(pattern)!=-1) ||
               (app.get_id() && app.get_id().slice(0, -8).toLowerCase().indexOf(pattern)!=-1))
               res.push(app.get_name());
            }
      } else
         res = applist;
      return res;
   },

   _clearAllSelections: function(hide_apps) {
       if(hide_apps) {
          for(let i = 0; i < this._applicationsButtons.length; i++) {
             this._applicationsButtons[i].actor.style_class = "menu-application-button";
             this._applicationsButtons[i].actor.hide();
          }
       } else  {
          for(let i = 0; i < this._applicationsButtons.length; i++) {
             this._applicationsButtons[i].actor.style_class = "menu-application-button";
          }
       }
       for(let i = 0; i < this._categoryButtons.length; i++){
          let actor = this._categoryButtons[i].actor;
          actor.set_style_class_name('menu-category-button');
          actor.add_style_class_name('menu-category-button-' + this.theme);
          this._categoryButtons[i].setArrowVisible(false);
          if(this.categoriesIncludes) {
             if(this.categoriesIncludes.indexOf(this._categoryButtons[i].getCategoryID()) != -1)
                actor.show();
          } else if((!this.categoriesExcludes)||(this.categoriesExcludes.indexOf(this._categoryButtons[i].getCategoryID()) == -1))
             actor.show();
       }
    },

    _setCategoriesButtonActive: function(active) {
       try {
          for(let i = 0; i < this._categoryButtons.length; i++) {
             let button = this._categoryButtons[i].actor;
             if(active) {
                button.set_style_class_name('menu-category-button');
                button.add_style_class_name('menu-category-button-' + this.theme);
             } else {
                button.set_style_class_name('menu-category-button-greyed');
                button.add_style_class_name('menu-category-button-greyed-' + this.theme);
             }
          }
          /*if(this.gnoMenuBox) {
             for(let i = 0; i < this.gnoMenuBox._actionButtons.length; i++)
                this.gnoMenuBox._setStyleGreyed(this.gnoMenuBox._actionButtons[i], active);
          }*/
       } catch (e) {
          Main.notify("Categ Erro", e.message)
          global.log(e);
       }
   },

   resetSearch: function(){
      this.searchEntry.set_text("");
      this._previousSearchPattern = "";
      this.searchActive = false;
      this._clearAllSelections(true);
      this._setCategoriesButtonActive(true);
      global.stage.set_key_focus(this.searchEntry);
   },

   _clearPrevAppSelection: function(actor) {
      if(this._previousSelectedActor && this._previousSelectedActor != actor) {
         this._previousSelectedActor.style_class = "menu-application-button";
      }
   },

   _clearPrevCatSelection: function(actor) {
      if(this._previousTreeSelectedActor) {
         if(this._previousTreeSelectedActor != actor) {
            this._previousTreeSelectedActor.set_style_class_name('menu-category-button');
            this._previousTreeSelectedActor.add_style_class_name('menu-category-button-' + this.theme);
            if(this._previousTreeSelectedActor._delegate) {
               try {
                  this._previousTreeSelectedActor._delegate.setArrowVisible(false);
               } catch(e) {}
               this._previousTreeSelectedActor._delegate.emit('leave-event');
            }
            if(actor !== undefined) {
               this._previousVisibleIndex = null;
               this._previousTreeSelectedActor = actor;
            }
         }
      } else {
         for(let i = 0; i < this._categoryButtons.length; i++) {
            this._categoryButtons[i].actor.set_style_class_name('menu-category-button');
            this._categoryButtons[i].actor.add_style_class_name('menu-category-button-' + this.theme);
            this._categoryButtons[i].setArrowVisible(false);
         }
      }
     // this.lastActor = null;
   },

   makeVectorBox: function(actor) {
      this.destroyVectorBox();
      let [catbox_x, catbox_y] = this.categoriesBox.get_transformed_position();
      let [catbox_w, catbox_h] = this.categoriesBox.get_transformed_size();
      let [appbox_x, appbox_y] = this.applicationsBox.get_transformed_position();
      let [appbox_w, appbox_h] = this.applicationsBox.get_transformed_size();
      if(catbox_y + catbox_h > appbox_y) {
         this.topPosition = appbox_y;
         this.bottomPosition = appbox_y + appbox_h;
         if(catbox_x < appbox_x) {
            this.horizontalPosition = appbox_x;
            this.vectorOrientation = St.Side.RIGHT;
         }
         else {
            this.horizontalPosition = appbox_x + appbox_w;
            this.vectorOrientation = St.Side.LEFT;
         }
         this.current_motion_actor = actor;
         this.actor_motion_id = this.current_motion_actor.connect("motion-event", Lang.bind(this, this.maybeUpdateVectorBox));
      }
   },

   maybeUpdateVectorBox: function() {
      try {
        if(this.vector_update_loop) {
           Mainloop.source_remove(this.vector_update_loop);
           this.vector_update_loop = null;
        }
        if(this.isInsideVectorBox())
           this.vector_update_loop = Mainloop.timeout_add(35, Lang.bind(this, this.updateVectorBox));
        else {
           this.updateVectorBox();
        }
      } catch(e) {
         Main.notify("error", e.message);
      }
   },

   updateVectorBox: function(actor) {
      if(this.vector_update_loop) {
         Mainloop.source_remove(this.vector_update_loop);
         this.vector_update_loop = null;
      }
      if((this.current_motion_actor) && (this.current_motion_actor._delegate.isHovered)) {
         if((!this.catShow)&&(this.current_motion_actor)) {
            if(this.lastedCategoryShow) {
               this._previousTreeSelectedActor = null;
               this._clearPrevCatSelection(null);
               this.lastedCategoryShow = null;
            }
            this._clearPrevCatSelection(this.current_motion_actor);
            this._select_category(this.current_motion_actor._delegate.category, this.current_motion_actor._delegate);
            this.catShow = true;
         }
         let [mx, my, mask] = global.get_pointer();
         this.mouseVectorX = mx;
         this.mouseVectorY = my;
      } else {
         this.destroyVectorBox();
      }
   },

   destroyVectorBox: function() {
      if(this.actor_motion_id > 0 && this.current_motion_actor != null) {
         this.current_motion_actor.disconnect(this.actor_motion_id);
         this.actor_motion_id = 0;
         this.current_motion_actor = null;
      }
   },

   isInsideVectorBox: function() {
      if(this.current_motion_actor) {
         let [mx, my, mask] = global.get_pointer();
         if((this.vectorOrientation == St.Side.RIGHT)&&(this.mouseVectorX >= mx)) {
            return false;
         }
         let mouseWidth = Math.abs(this.mouseVectorX - mx);
         let mouseHeight = Math.abs(this.mouseVectorY - my);
         let currentHeigth;
         if(my <= this.mouseVectorY)
            currentHeigth = Math.abs(this.mouseVectorY - this.topPosition);
         else
            currentHeigth = Math.abs(this.mouseVectorY - this.bottomPosition);
         let currentWidth = Math.abs(this.mouseVectorX - this.horizontalPosition);
         let realHeigth = (mouseWidth*currentHeigth)/currentWidth;
         return (realHeigth >= mouseHeight);
      }
      return false;
   },

   _select_category: function(dir, categoryButton) {
      if(categoryButton) {
         categoryButton.actor.set_style_class_name('menu-category-button-selected');
         categoryButton.actor.add_style_class_name('menu-category-button-selected-' + this.theme);
         categoryButton.setArrowVisible(true);
         if(dir) {
            this._displayButtons(this._listApplications(dir.get_menu_id()));
         } else if(categoryButton == this.placesButton) {
            this._displayButtons(null, -1);
         } else if(categoryButton == this.recentButton) {
            this._displayButtons(null, null, -1);
         } else {//all
            this._displayButtons(this._listApplications(null));
         }
         this.openGnomeMenu(categoryButton.actor);
      }
      this.closeApplicationsContextMenus(false);
   },

   closeApplicationsContextMenus: function(animate) {
      if((this._previousContextMenuOpen)&&(this._previousContextMenuOpen.menu)&&(this._previousContextMenuOpen.menu.isOpen)) {
         if(animate)
            this._previousContextMenuOpen.toggleMenu();
         else
            this._previousContextMenuOpen.closeMenu();
      }
      this._previousContextMenuOpen = null;
   },

   _displayButtons: function(appCategory, places, recent, apps, autocompletes, search) {
      this.visibleAppButtons = new Array();
      if(appCategory) {
         if(appCategory == "all") {
            for(let i = 0; i < this._applicationsButtons.length; i++) {
               this.visibleAppButtons.push(this._applicationsButtons[i]);
            }
         } else {
            for(let i = 0; i < this._applicationsButtons.length; i++) {
               if(this._applicationsButtons[i].category.indexOf(appCategory) != -1) {
                  this.visibleAppButtons.push(this._applicationsButtons[i]);
               }
            }
         }
      } else if(apps) {
         for(let i = 0; i < this._applicationsButtons.length; i++) {
            if(apps.indexOf(this._applicationsButtons[i].name) != -1) {
               this.visibleAppButtons.push(this._applicationsButtons[i]);
            }
         }
      }
      if(places) {
         if(places == -1) {
            for(let i = 0; i < this._placesButtons.length; i++) {
               this.visibleAppButtons.push(this._placesButtons[i]);
            }
         } else {
            for(let i = 0; i < this._placesButtons.length; i++) {
               if(places.indexOf(this._placesButtons[i].button_name) != -1) {
                  this.visibleAppButtons.push(this._placesButtons[i]);
               }
            }
         }
      }
      if(recent) {
         if(recent == -1) {
            for(let i = 0; i < this._recentButtons.length; i++) {
               this.visibleAppButtons.push(this._recentButtons[i]);
            }
         } else {
            for(let i = 0; i < this._recentButtons.length; i++) {
               if(recent.indexOf(this._recentButtons[i].button_name) != -1) {
                  this.visibleAppButtons.push(this._recentButtons[i]);
               }
            }
         }
      }

      if(this._transientButtons.length > 0) {
         let parentTrans;
         for(let indexT in this._transientButtons) {
            parentTrans = this._transientButtons[indexT].actor.get_parent();
            if(parentTrans)
               parentTrans.remove_actor(this._transientButtons[indexT].actor);
            this._transientButtons[indexT].actor.destroy();
         }
         this._transientButtons = new Array();
      }

      if(autocompletes) {
         let viewBox;
         for(let i = 0; i < autocompletes.length; i++) {
            let button = new MenuItems.TransientButton(this, this.applicationsScrollBox, autocompletes[i], this.iconAppSize, this.iconView,
                                                     this.textButtonWidth, this.appButtonDescription);
            if(this._applicationsBoxWidth > 0)
               button.container.set_width(this._applicationsBoxWidth);
            //button.actor.connect('realize', Lang.bind(this, this._onApplicationButtonRealized));
            button.actor.connect('leave-event', Lang.bind(this, this._appLeaveEvent, button));
            this._addEnterEvent(button, Lang.bind(this, this._appEnterEvent, button));
            this._transientButtons.push(button);
            button.actor.visible = true;
            this.visibleAppButtons.push(button);
            button.actor.realize();
         }
      }
      if((search) && (this.enablePackageSearch)) {
         this.packageAppBox.show();
         this.packageAppSeparator.actor.show();
         this.pkg.updateButtonStatus(this.iconAppSize, this.textButtonWidth, this.appButtonDescription, this.iconView, this._applicationsBoxWidth);
         this.pkg.executeSearch(search);
      } else {
         this.packageAppBox.hide();
         this.packageAppSeparator.actor.hide();
      }
      if((search) && (this.searchWeb)) {
         this.visibleSearchButtons = new Array();
         for(let i = 0; i < this._searchItems.length; i++) {
            this._searchItems[i].actor.visible = true;
            this.visibleSearchButtons.push(this._searchItems[i]);
            this._searchItems[i].actor.style_class = "menu-application-button";
            if(!(this._searchItems[i] instanceof PopupMenu.PopupSeparatorMenuItem))
               this._searchItems[i].setString(search);
         }
         if(this.visibleSearchButtons.length > 0)
            this.searchAppSeparator.actor.show();
         else
            this.searchAppSeparator.actor.hide();
      } else if(this.visibleSearchButtons) {
         for(let i in this._searchItems) {
            this._searchItems[i].actor.hide();
         }
         this.searchAppSeparator.actor.hide();
         this.visibleSearchButtons = null;
      }
      if(search)
          this._reorderButtons(search);
      this._updateView();
   },

   _reorderButtons: function(pattern) {
      switch(this.searchSorted) {
         case 'name'     :
            break;
         case 'relevance':
            this.visibleAppButtons.sort(function(a, b) {
               let sr = 0;
               if(a.search) a.search(pattern);
               if(b.search) b.search(pattern);
               sr = b.searchScore - a.searchScore;
               if(sr == 0)
                  sr = a.name.toLowerCase() > b.name.toLowerCase();
               return sr;
            });
            break;
         case 'usage-name':
            this.visibleAppButtons.sort(Lang.bind(this, function(a, b) {
               let sr = 0;
               if(this.appsUsage) {
                  let bUsage, aUsage;
                  if(b.app)
                     bUsage = this.appsUsage[b.app.get_id()];
                  if(a.app)
                     aUsage = this.appsUsage[a.app.get_id()];
                  if(!bUsage) bUsage = 0;
                  if(!aUsage) aUsage = 0;
                  sr = bUsage - aUsage;
               }
               if(sr == 0) {
                  let bName, aName;
                  if(b.app)
                     bName = b.app.get_name().toLowerCase();
                  if(a.app)
                     aName = a.app.get_name().toLowerCase();
                  if(!bName) bName = "";
                  if(!aName) aName = "";
                  sr = aName > bName;
               }
               return sr;
            }));
            break;
         case 'usage-relevance':
            this.visibleAppButtons.sort(Lang.bind(this, function(a, b) {
               let sr = 0;
               if(this.appsUsage) {
                  let bUsage, aUsage;
                  if(b.app)
                     bUsage = this.appsUsage[b.app.get_id()];
                  if(a.app)
                     aUsage = this.appsUsage[a.app.get_id()];
                  if(!bUsage) bUsage = 0;
                  if(!aUsage) aUsage = 0;
                  sr = bUsage - aUsage;
               }
               if(sr == 0) {
                  if(a.search) a.search(pattern);
                  if(b.search) b.search(pattern);
                  sr = b.searchScore - a.searchScore;
               }
               if(sr == 0) {
                  let bName, aName;
                  if(b.app)
                     bName = b.app.get_name().toLowerCase();
                  if(a.app)
                     aName = a.app.get_name().toLowerCase();
                  if(!bName) bName = "";
                  if(!aName) aName = "";
                  sr = aName > bName;
               }
               return sr;
            }));
            break;
         default         :
            break;
      }
   },

   _onSearchTextChanged: function(se, prop) {
      if(this.menuIsOpening) {
         this.menuIsOpening = false;
         return false;
      } else {
         let searchString = this.searchEntry.get_text();
         this.searchActive = searchString != '';
         this._fileFolderAccessActive = this.searchActive && this.searchFilesystem;
         this._clearAllSelections();
         this._selectDisplayLayout(se, prop);
         if(this.searchActive) {
            this.searchEntry.set_secondary_icon(this._searchActiveIcon);
            if(this._searchIconClickedId == 0) {
               this._searchIconClickedId = this.searchEntry.connect('secondary-icon-clicked',
               Lang.bind(this, function() {
                  this.resetSearch();
                  this._select_category(null, this._allAppsCategoryButton);
               }));
            }
            this._setCategoriesButtonActive(false);
            this._doSearch();
         } else {
            if(this._searchIconClickedId > 0)
               this.searchEntry.disconnect(this._searchIconClickedId);
            this._searchIconClickedId = 0;
            this.searchEntry.set_secondary_icon(this._searchInactiveIcon);
            this._previousSearchPattern = "";
            this._setCategoriesButtonActive(true);
            if(!this.appMenu) {
               this._select_category(null, this._allAppsCategoryButton);
            }
         }
         return false;
      }
   },

   _doSearch: function() {
      this._searchTimeoutId = 0;
      let pattern = this.searchEntryText.get_text().replace(/^\s+/g, '').replace(/\s+$/g, '').toLowerCase();
      if(pattern==this._previousSearchPattern) return false;
      this._previousSearchPattern = pattern;
      this._activeContainer = null;
      this._activeActor = null;
      this._selectedItemIndex = null;
      this._previousTreeItemIndex = null;
      this._previousTreeSelectedActor = null;
      this._previousSelectedActor = null;
       
      // _listApplications returns all the applications when the search
      // string is zero length. This will happend if you type a space
      // in the search entry.
      if(pattern.length == 0) {
         return false;
      }

      let appResults = this._listApplications(null, pattern);
      let placesResults = new Array();
      let bookmarks = this._listBookmarks(pattern);
      for(let i in bookmarks)
         placesResults.push(bookmarks[i].name);
      let devices = this._listDevices(pattern);
      for(let i in devices)
         placesResults.push(devices[i].name);
      let recentResults = new Array();
      for(let i = 0; i < this._recentButtons.length; i++) {
         if(!(this._recentButtons[i] instanceof MenuItems.RecentClearButton) && this._recentButtons[i].button_name.toLowerCase().indexOf(pattern) != -1)
            recentResults.push(this._recentButtons[i].button_name);
      }

      let acResults = new Array(); // search box autocompletion results
      if(this.searchFilesystem) {
         // Don't use the pattern here, as filesystem is case sensitive
         acResults = this._getCompletions(this.searchEntryText.get_text());
      }

      //this._displayButtons(null, placesResults, recentResults, appResults, acResults);
      this._displayButtons(null, placesResults, recentResults, appResults, acResults, this.searchEntryText.get_text());
      this.appBoxIter.reloadVisible();
      if(this.appBoxIter.getNumVisibleChildren() > 0) {
         let item_actor = this.appBoxIter.getFirstVisible();
         this._selectedItemIndex = this.appBoxIter.getAbsoluteIndexOfChild(item_actor);
         this._activeContainer = this.applicationsBox;
         if(item_actor && item_actor != this.searchEntry) {
            //this.lastActor = null;
            item_actor._delegate.emit('enter-event');
         }
      }
      return false;
   },

   _getCompletion : function(text) {
      if(text.indexOf('/') != -1) {
         if(text.substr(text.length - 1) == '/') {
            return '';
         } else {
            return this._pathCompleter.get_completion_suffix(text);
         }
      } else {
         return false;
      }
   },

   _getCompletions : function(text) {
      if(text.indexOf('/') != -1) {
         return this._pathCompleter.get_completions(text);
      } else {
         return new Array();
      }
   },

   _selectDisplayLayout: function(actor, event) {
      if((this.bttChanger)&&(this.bttChanger.getSelected() == _("All Applications"))&&(this.searchActive)) {
         this.bttChanger.activateNext();
      }
      if((this.gnoMenuBox)&&(this.gnoMenuBox.getSelected() != _("All Applications"))&&(this.searchActive)) {
         this.gnoMenuBox.setSelected(_("All Applications"));
      }
      if(this.appMenu) {
         if(this.searchActive) {
            this.openGnomeMenu();
         } else {
            this.appMenuClose();
         }
      }
   },
/*
   _onApplicationButtonRealized: function(actor) {
      if(actor.get_width() > this._applicationsBoxWidth) {
         this._applicationsBoxWidth = actor.get_width(); // The answer to life...
         //this.applicationsBox.set_width(this.iconViewCount*this._applicationsBoxWidth + 42);
      }
   },
*/
   _refreshFavs: function() {
      if(this.fRef) return false;
      this.fRef = true;
      //Remove all favorites
      /*this.favoritesBox.get_children().forEach(Lang.bind(this, function (child) {
          child.destroy();
      }));
      this.favoritesObj = new MenuBox.FavoritesBoxExtended(this, true, this.favoritesLinesNumber);
      this.favoritesBox.add(this.favoritesObj.actor, { x_fill: true, y_fill: true, x_align: St.Align.END, y_align: St.Align.MIDDLE, expand: false });*/

      this.favoritesObj.removeAll();
      if(this.favoritesObj.getNumberLines() != this.favoritesLinesNumber)
         this.favoritesObj.setNumberLines(this.favoritesLinesNumber);
         
      //Load favorites again
      this._favoritesButtons = new Array();
      let launchers = global.settings.get_strv('favorite-apps');
      let appSys = Cinnamon.AppSystem.get_default();
      let j = 0;
      for(let i = 0; i < launchers.length; ++i) {
         let app = appSys.lookup_app(launchers[i]);
         if(app) {
            let button = new MenuItems.FavoritesButton(this, this.favoritesScrollBox, this.iconView, this.favoritesObj.getVertical(),
                                                     app, "", launchers.length/this.favoritesLinesNumber, this.iconMaxFavSize,
                                                     this.allowFavName, this.textButtonWidth, this.appButtonDescription, this._applicationsBoxWidth);
            // + 3 because we're adding 3 system buttons at the bottom
            this._favoritesButtons[app] = button;
            this.favoritesObj.add(button.actor, button.menu, { x_align: St.Align.START, y_align: St.Align.MIDDLE, x_fill: true, y_fill: true, expand: true });
            //favoritesBox.actor.add(button.actor, { y_align: St.Align.MIDDLE, x_align: St.Align.MIDDLE, y_fill: false, expand: true });
            button.actor.connect('enter-event', Lang.bind(this, function() {
               //this._clearPrevCatSelection();
               this.hover.refreshApp(button.app);
               if(button.app.get_description())
                  this.selectedAppBox.setSelectedText(button.app.get_name(), button.app.get_description().split("\n")[0]);
               else
                  this.selectedAppBox.setSelectedText(button.app.get_name(), "");
            }));
            button.actor.connect('leave-event', Lang.bind(this, function() {
               this.selectedAppBox.setSelectedText("", "");
               this.hover.refreshFace();
            }));
            button.actor.connect('key-press-event', Lang.bind(this, this._onMenuKeyPress));
            ++j;
         }
      }

      this.fRef = false;
      return true;
   },

   _refreshApps: function() {
      for(let i = 0; i < this._categoryButtons.length; i++)
         this._categoryButtons[i].actor.destroy();
      this.standarAppBox.destroy_all_children();
      this._applicationsButtons = new Array();
      this._transientButtons = new Array();
      this._categoryButtons = new Array();
      this._applicationsButtonFromApp = new Object(); 
      this._applicationsBoxWidth = 0;
      this._activeContainer = null;
      //Remove all categories
      this._clearView();
      this.iconViewCount = 1;
      this.categoriesBox.destroy_all_children();

      this._allAppsCategoryButton = new MenuItems.CategoryButton(null, this.iconCatSize, this.showCategoriesIcons);
      this._addEnterEvent(this._allAppsCategoryButton, Lang.bind(this, function() {
         if(!this.searchActive) {
            this._allAppsCategoryButton.isHovered = true;
            if(this.hover_delay > 0) {
               Tweener.addTween(this, {
                  time: this.hover_delay, onComplete: function () {
                     this._previousTreeSelectedActor = null;
                     this._clearPrevCatSelection(this._allAppsCategoryButton.actor);
                     if(this._allAppsCategoryButton.isHovered) {
                        this._select_category(null, this._allAppsCategoryButton);
                        this._allAppsCategoryButton.actor.set_style_class_name('menu-category-button-selected');
                        this._allAppsCategoryButton.actor.add_style_class_name('menu-category-button-selected-' + this.theme);
                     } else {
                        this._allAppsCategoryButton.actor.set_style_class_name('menu-category-button');
                        this._allAppsCategoryButton.actor.add_style_class_name('menu-category-button-' + this.theme);
                     }
                  }
               });
            } else {
               this.catShow = false;
               if(!this.isInsideVectorBox()) {
                  if(this.lastedCategoryShow) {
                     this._previousTreeSelectedActor = null;
                     this._clearPrevCatSelection(null);
                     this.lastedCategoryShow = null;
                  }
                  this._clearPrevCatSelection(this._allAppsCategoryButton.actor);
                  this._select_category(null, this._allAppsCategoryButton);
                  this.catShow = true;
               } else if(!this.lastedCategoryShow)
                  this.lastedCategoryShow = this._allAppsCategoryButton;
               this.makeVectorBox(this._allAppsCategoryButton.actor);
            }
         }
      }));
      this._allAppsCategoryButton.actor.connect('leave-event', Lang.bind(this, function () {
         this._previousSelectedActor = this._allAppsCategoryButton.actor;
         this._allAppsCategoryButton.isHovered = false;
      }));

      this._categoryButtons.push(this._allAppsCategoryButton);
    
      let trees = [appsys.get_tree()];
      for(let i in trees) {
         let tree = trees[i];
         let root = tree.get_root_directory();
            
         let iter = root.iter();
         let nextType;
         while((nextType = iter.next()) != CMenu.TreeItemType.INVALID) {
            if(nextType == CMenu.TreeItemType.DIRECTORY) {
               let dir = iter.get_directory();
               if(dir.get_is_nodisplay())
                  continue;
               if(this._loadCategory(dir)) {
                  let categoryButton = new MenuItems.CategoryButton(dir, this.iconCatSize, this.showCategoriesIcons);
                  this._addEnterEvent(categoryButton, Lang.bind(this, function() {
                     if(!this.searchActive) {
                        categoryButton.isHovered = true;
                        if(this.hover_delay > 0) {
                           Tweener.addTween(this, {
                              time: this.hover_delay, onComplete: function () {
                                 this._previousTreeSelectedActor = null;
                                 this._clearPrevCatSelection(categoryButton.actor);
                                 if(categoryButton.isHovered) { 
                                    this._select_category(dir, categoryButton);
                                    categoryButton.actor.set_style_class_name('menu-category-button-selected');
                                    categoryButton.actor.add_style_class_name('menu-category-button-selected-' + this.theme);
                                 } else {
                                    categoryButton.actor.set_style_class_name('menu-category-button');
                                    categoryButton.actor.add_style_class_name('menu-category-button-' + this.theme);
                                 }
                              }
                           });
                        } else {
                           this.catShow = false;
                           if(!this.isInsideVectorBox()) {
                              if(this.lastedCategoryShow) {
                                 this._previousTreeSelectedActor = null;
                                 this._clearPrevCatSelection(null);
                                 this.lastedCategoryShow = null;
                              }
                              this._clearPrevCatSelection(categoryButton.actor);
                              this._select_category(dir, categoryButton);
                              this.catShow = true;
                           } else if(!this.lastedCategoryShow)
                               this.lastedCategoryShow = categoryButton;
                           this.makeVectorBox(categoryButton.actor);
                        }
                     }
                  }));
                  categoryButton.actor.connect('leave-event', Lang.bind(this, function () {
                     if(this._previousTreeSelectedActor === null) {
                        this._previousTreeSelectedActor = categoryButton.actor;
                     } else {
                        let prevIdx = this.catBoxIter.getVisibleIndex(this._previousTreeSelectedActor);
                        let nextIdx = this.catBoxIter.getVisibleIndex(categoryButton.actor);
                        if(Math.abs(prevIdx - nextIdx) <= 1) {
                           this._previousTreeSelectedActor = categoryButton.actor;
                        }
                     }
                     categoryButton.isHovered = false;
                  }));
                  this._categoryButtons.push(categoryButton);
               }
            }
         } 
      }
      // Sort apps and add to applicationsBox
      this._applicationsButtons.sort(function(a, b) {
         let sr = a.app.get_name().toLowerCase() > b.app.get_name().toLowerCase();
         return sr;
      });

      this._appsWereRefreshed = true;

      try {
         let catVertical = !this.categoriesBox.get_vertical();
         if(this.categoriesBox.get_children().length == 0) {
            let wrapperCatBox = new St.BoxLayout({ vertical: this.categoriesBox.get_vertical() });
            let viewBox = new St.BoxLayout({ vertical: this.categoriesBox.get_vertical() });
            wrapperCatBox.add_actor(viewBox);
            this.categoriesBox.add_actor(wrapperCatBox);
            for(let i = 0; i < this._categoryButtons.length; i++) {
               this._categoryButtons[i].setVertical(catVertical);
               viewBox.add_actor(this._categoryButtons[i].actor);
               this._setCategoryArrow(this._categoryButtons[i]);
            }
         }
         this._clearPrevCatSelection(this._allAppsCategoryButton.actor);
         this._select_category(null, this._allAppsCategoryButton);
      } catch(e) {
         Main.notify("errr", e.message);
      }
      this._refreshPlacesAndRecent();
   },

   _refreshPlacesAndRecent: function() {
      let newCatSelection = new Array();
      for(let i = 0; i < this._placesButtons.length; i ++) {
         this._placesButtons[i].actor.destroy();
      }
      for(let i = 0; i < this._recentButtons.length; i ++) {
         this._recentButtons[i].actor.destroy();
      }
      if(this.categoriesBox.get_children().length == 0) {
         let wrapperCatBox = new St.BoxLayout({ vertical: this.categoriesBox.get_vertical() });
         let viewBox = new St.BoxLayout({ vertical: this.categoriesBox.get_vertical() });
         wrapperCatBox.add_actor(viewBox);
         this.categoriesBox.add_actor(wrapperCatBox);
      }
      let tempCat;
      for(let i = 0; i < this._categoryButtons.length; i++) {
         tempCat = this._categoryButtons[i];
         if(!(tempCat instanceof MenuItems.PlaceCategoryButton) && 
            !(tempCat instanceof MenuItems.RecentCategoryButton)) {
            newCatSelection.push(this._categoryButtons[i]);
         } else {
            let catParent = this._categoryButtons[i].actor.get_parent();
            if(catParent)
                catParent.remove_actor(this._categoryButtons[i].actor);
            this._categoryButtons[i].actor.destroy();
         }
      }
      this._categoryButtons = newCatSelection;
      this._placesButtons = new Array();
      this._recentButtons = new Array();

      if(this.appletMenu) {
         this.appMenuClose();
         this.appletMenu.getActorForName("Places").visible = this.showPlaces;
      }
      if(this.gnoMenuBox) {
         this.gnoMenuBox.showPlaces(this.showPlaces);
         this.gnoMenuBox.showRecents(this.showRecent);
      }
      // Now generate Places category and places buttons and add to the list
      if(this.showPlaces) {
         this.placesButton = new MenuItems.PlaceCategoryButton(null, this.iconCatSize, this.showCategoriesIcons);
         this._addEnterEvent(this.placesButton, Lang.bind(this, function() {
            if(!this.searchActive) {
               this.placesButton.isHovered = true;
               if(this.hover_delay > 0) {
                  Tweener.addTween(this, {
                     time: this.hover_delay, onComplete: function () {
                        this._previousTreeSelectedActor = null;
                        this._clearPrevCatSelection(this.placesButton.actor);
                        if(this.placesButton.isHovered) {
                           this._select_category(null, this.placesButton);
                           this.placesButton.actor.set_style_class_name('menu-category-button-selected');
                           this.placesButton.actor.add_style_class_name('menu-category-button-selected-' + this.theme);
                        } else {
                           this.placesButton.actor.set_style_class_name('menu-category-button');
                           this.placesButton.actor.add_style_class_name('menu-category-button-' + this.theme);
                        }
                     }
                  });
               } else {
                  this.catShow = false;
                  if(!this.isInsideVectorBox()) {
                     if(this.lastedCategoryShow) {
                        this._previousTreeSelectedActor = null;
                        this._clearPrevCatSelection(null);
                        this.lastedCategoryShow = null;
                     }
                     this._clearPrevCatSelection(this.placesButton.actor);
                     this._select_category(null, this.placesButton);
                     this.catShow = true;
                  } else if(!this.lastedCategoryShow)
                     this.lastedCategoryShow = this.placesButton;
                  this.makeVectorBox(this.placesButton.actor);
               }
            }
         }));
         this.placesButton.actor.connect('leave-event', Lang.bind(this, function () {
            if(this._previousTreeSelectedActor === null) {
               this._previousTreeSelectedActor = this.placesButton.actor;
            } else {
               let prevIdx = this.catBoxIter.getVisibleIndex(this._previousTreeSelectedActor);
               let nextIdx = this.catBoxIter.getVisibleIndex(this.placesButton.actor);
               let idxDiff = Math.abs(prevIdx - nextIdx);
               let numVisible = this.catBoxIter.getNumVisibleChildren();
               if(idxDiff <= 1 || Math.min(prevIdx, nextIdx) < 0) {
                  this._previousTreeSelectedActor = this.placesButton.actor;
               }
            }
            this.placesButton.isHovered = false;
         }));
         this._categoryButtons.push(this.placesButton);
         this.placesButton.setVertical(!this.categoriesBox.get_vertical());
         this.categoriesBox.get_child_at_index(0).get_child_at_index(0).add_actor(this.placesButton.actor);
         this._setCategoryArrow(this.placesButton);

         let bookmarks = this._listBookmarks();
         let devices = this._listDevices();
         let places = bookmarks.concat(devices);
         for(let i = 0; i < places.length; i++) {
            let place = places[i];
            let button = new MenuItems.PlaceButton(this, this.applicationsScrollBox, place, this.iconView,
                                                 this.iconAppSize, this.textButtonWidth, this.appButtonDescription);
            this._addEnterEvent(button, Lang.bind(this, function() {
               this._clearPrevAppSelection(button.actor);
               button.actor.style_class = "menu-application-button-selected";
               
               this.selectedAppBox.setSelectedText(button.app.get_name(), button.app.get_description());
               this.hover.refreshPlace(button.place);
            }));
            button.actor.connect('leave-event', Lang.bind(this, function() {
               this._previousSelectedActor = button.actor;
               button.actor.style_class = "menu-application-button";
               this.selectedAppBox.setSelectedText("", "");
               this.hover.refreshFace();
            }));
            this._placesButtons.push(button);
            if(this._applicationsBoxWidth > 0)
               button.container.set_width(this._applicationsBoxWidth);
         }
      }
      // Now generate recent category and recent files buttons and add to the list
      if(this.showRecent) {
         this.recentButton = new MenuItems.RecentCategoryButton(null, this.iconCatSize, this.showCategoriesIcons);
         this._addEnterEvent(this.recentButton, Lang.bind(this, function() {
            if(!this.searchActive) {
               this.recentButton.isHovered = true;
               if(this.hover_delay > 0) {
                  Tweener.addTween(this, {
                     time: this.hover_delay, onComplete: function () {
                        this._previousTreeSelectedActor = null;
                        this._clearPrevCatSelection(this.recentButton.actor);
                        if(this.recentButton.isHovered) {
                           this._select_category(null, this.recentButton);
                           this.recentButton.actor.set_style_class_name('menu-category-button-selected');
                           this.recentButton.actor.add_style_class_name('menu-category-button-selected-' + this.theme);
                        } else {
                           this.recentButton.actor.set_style_class_name('menu-category-button');
                           this.recentButton.actor.add_style_class_name('menu-category-button-' + this.theme);
                        }
                     }
                  });
               } else {
                  this.catShow = false;
                  if(!this.isInsideVectorBox()) {
                     if(this.lastedCategoryShow) {
                        this._previousTreeSelectedActor = null;
                        this._clearPrevCatSelection(null);
                        this.lastedCategoryShow = null;
                     }
                     this._clearPrevCatSelection(this.recentButton.actor);
                     this._select_category(null, this.recentButton);
                     this.catShow = true;
                  } else if(!this.lastedCategoryShow)
                     this.lastedCategoryShow = this.recentButton;
                  this.makeVectorBox(this.recentButton.actor);
               }
            }
         }));
         this.recentButton.actor.connect('leave-event', Lang.bind(this, function () {  
            if(this._previousTreeSelectedActor === null) {
               this._previousTreeSelectedActor = this.recentButton.actor;
            } else {
               let prevIdx = this.catBoxIter.getVisibleIndex(this._previousTreeSelectedActor);
               let nextIdx = this.catBoxIter.getVisibleIndex(this.recentButton.actor);
               let numVisible = this.catBoxIter.getNumVisibleChildren();
                    
               if(Math.abs(prevIdx - nextIdx) <= 1) {
                  this._previousTreeSelectedActor = this.recentButton.actor;
               }
            }
            this.recentButton.isHovered = false;
         }));

         this.categoriesBox.get_child_at_index(0).get_child_at_index(0).add_actor(this.recentButton.actor);
         this.recentButton.setVertical(!this.categoriesBox.get_vertical());
         this._categoryButtons.push(this.recentButton);
         this._setCategoryArrow(this.recentButton);

         if(this.RecentManager._infosByTimestamp.length > 0) {
            let button = new MenuItems.RecentClearButton(this, this.iconView, this.iconAppSize, this.textButtonWidth, this.appButtonDescription);
            this._addEnterEvent(button, Lang.bind(this, function() {
               this._clearPrevAppSelection(button.actor);
               button.actor.style_class = "menu-application-button-selected";
               this.selectedAppBox.setSelectedText(button.getName(), "");
               this.hover.refresh("edit-clear");
            }));
            button.actor.connect('leave-event', Lang.bind(this, function() {
               button.actor.style_class = "menu-application-button";
               this._previousSelectedActor = button.actor;
               this.selectedAppBox.setSelectedText("", "");
               this.hover.refreshFace();
            }));
            this._recentButtons.push(button);
            if(this._applicationsBoxWidth > 0)
               button.container.set_width(this._applicationsBoxWidth);
         }

         for(let id = 0; id < MAX_RECENT_FILES && id < this.RecentManager._infosByTimestamp.length; id++) {
            let button = new MenuItems.RecentButton(this, this.applicationsScrollBox, this.RecentManager._infosByTimestamp[id], this.iconView,
                                                  this.iconAppSize, this.textButtonWidth, this.appButtonDescription);
            this._addEnterEvent(button, Lang.bind(this, function() {
               this._clearPrevAppSelection(button.actor);
               button.actor.style_class = "menu-application-button-selected";
               this.selectedAppBox.setSelectedText(button.getName(), button.getDescription());
               this.hover.refreshFile(button.file);
            }));
            button.actor.connect('leave-event', Lang.bind(this, function() {
               button.actor.style_class = "menu-application-button";
               this._previousSelectedActor = button.actor;
               this.selectedAppBox.setSelectedText("", "");
               this.hover.refreshFace();
            }));
            this._recentButtons.push(button);
            if(this._applicationsBoxWidth > 0)
               button.container.set_width(this._applicationsBoxWidth);
         }
      }
      this._setCategoriesButtonActive(!this.searchActive);
      this.excludeCategories();
   },

   _appLeaveEvent: function(a, b, applicationButton) {
      this._previousSelectedActor = applicationButton.actor;
      applicationButton.actor.style_class = "menu-application-button";
      this.selectedAppBox.setSelectedText("", "");
      this.hover.refreshFace();
   },

   _appEnterEvent: function(applicationButton) {
      if(applicationButton.app.get_description())
         this.selectedAppBox.setSelectedText(applicationButton.app.get_name(), applicationButton.app.get_description());
      else
         this.selectedAppBox.setSelectedText(applicationButton.app.get_name(), "");
      this._previousVisibleIndex = this.appBoxIter.getVisibleIndex(applicationButton.actor);
      this._clearPrevAppSelection(applicationButton.actor);
      applicationButton.actor.style_class = "menu-application-button-selected";
      this.hover.refreshApp(applicationButton.app);
   },

   _addEnterEvent: function(button, callback) {
      let _callback = Lang.bind(this, function() {
         try {
            let parent = button.actor.get_parent()
            if(parent)
               parent = parent.get_parent();
            if((parent)&&(parent != this.categoriesBox))
               parent = parent.get_parent();
            if(this._activeContainer !== this.applicationsBox && parent !== this._activeContainer) {
               this._previousTreeItemIndex = this._selectedItemIndex;
               this._previousTreeSelectedActor = this._activeActor;
               this._previousSelectedActor = null;
            }
            if(this._previousTreeSelectedActor && this._activeContainer !== this.categoriesBox &&
               parent !== this._activeContainer && button !== this._previousTreeSelectedActor) {
               this._previousTreeSelectedActor.set_style_class_name('menu-category-button');
               this._previousTreeSelectedActor.add_style_class_name('menu-category-button-' + this.theme);
            }
            if((parent)&&(parent != this._activeContainer)) {
               parent._vis_iter.reloadVisible();
            }
            let _maybePreviousActor = this._activeActor;
            if(_maybePreviousActor && this._activeContainer === this.applicationsBox) {
               this._previousSelectedActor = _maybePreviousActor;
               this._clearPrevAppSelection();
            }
            if(parent === this.categoriesBox && !this.searchActive) {
               this._previousSelectedActor = _maybePreviousActor;
            }
            this._activeContainer = parent;
            this._activeActor = button.actor;
            if(this._activeContainer) {
               this._selectedItemIndex = this._activeContainer._vis_iter.getAbsoluteIndexOfChild(this._activeActor);
               this._selectedCategoryIndex = this._activeContainer._vis_iter.getCategoryIndexOfChild(this._activeActor);
               this._selectedRowIndex = this._activeContainer._vis_iter.getInternalIndexOfChild(this._activeActor);
            }
            callback();
         } catch(e) {
            Main.notify("Error on addEnterEvent", e.message);
         }
      });
      if((button instanceof MenuItems.CategoryButton)&&(!this.categoriesHover)) {
         button.actor.connect('button-press-event', Lang.bind(this, function() {
            this.pressed = true;
            this._clearPrevCatSelection(null);
            _callback();
         }));
      } else {
         button.actor.connect('enter-event', _callback);
      }
      button.connect('enter-event', _callback);
   },

   _loadCategory: function(dir, top_dir) {
      var iter = dir.iter();
      var has_entries = false;
      var nextType;
      if(!top_dir) top_dir = dir;
      while((nextType = iter.next()) != CMenu.TreeItemType.INVALID) {
         if(nextType == CMenu.TreeItemType.ENTRY) {
            var entry = iter.get_entry();
            if(!entry.get_app_info().get_nodisplay()) {
               has_entries = true;
               var app = appsys.lookup_app_by_tree_entry(entry);
               if(!app)
                  app = appsys.lookup_settings_app_by_tree_entry(entry);
               var app_key = app.get_id()
               if(app_key == null) {
                  app_key = app.get_name() + ":" + 
                  app.get_description();
               }
               if(!(app_key in this._applicationsButtonFromApp)) {
                  let applicationButton = new MenuItems.ApplicationButton(this, this.applicationsScrollBox, app, this.iconView, this.iconAppSize,
                                                                        this.iconMaxFavSize, this.textButtonWidth, this.appButtonDescription);
                  this._applicationsButtons.push(applicationButton);
                  applicationButton.actor.connect('leave-event', Lang.bind(this, this._appLeaveEvent, applicationButton));
                  this._addEnterEvent(applicationButton, Lang.bind(this, this._appEnterEvent, applicationButton));
                  applicationButton.category.push(top_dir.get_menu_id());
                  this._applicationsButtonFromApp[app_key] = applicationButton;
                  var app_is_known = false;
                  for(let i = 0; i < this._knownApps.length; i++) {
                     if(this._knownApps[i] == app_key) {
                        app_is_known = true;
                     }
                  }
                  if(!app_is_known) {
                     if(this._appsWereRefreshed) {
                        applicationButton.highlight();
                     }
                     else {
                        this._knownApps.push(app_key);
                     }
                  }
               } else {
                  this._applicationsButtonFromApp[app_key].category.push(dir.get_menu_id());
               }
            }
         } else if (nextType == CMenu.TreeItemType.DIRECTORY) {
            let subdir = iter.get_directory();
            if(this._loadCategory(subdir, top_dir)) {
               has_entries = true;
            }
         }
      }
      return has_entries;
   },

   _initialDisplay: function() {
      if(!this.displayed) {
         this.displayed = true;
         for(let i = 0; i < this._categoryButtons.length; i++) {
            this._categoryButtons[i].actor.show();
         }
         for(let i = 0; i < this._favoritesButtons.length; i++) {
            this._favoritesButtons[i].actor.show();
         }
         this.standarHeight = this.standarAppBox.get_height();
         let box = this.applicationsScrollBox.actor.get_allocation_box();
         if(this._applicationsButtons.length > 0)
            this.MaxH = this._applicationsButtons[0].actor.get_height();
         let maxApp = Math.floor(this.iconViewCount*(box.y2 - box.y1)/this.MaxH);
         this.initButtonLoad = Math.min(this._applicationsButtons.length, maxApp + 1);
         for(let i = 0; i < this.initButtonLoad; i++) {
            this._applicationsButtons[i].actor.show();
         }
         Mainloop.idle_add(Lang.bind(this, this._initial_cat_selection, this.initButtonLoad));
      }
   },

   _initial_cat_selection: function (start_index) {
      let n = this._applicationsButtons.length;
      for(let i = start_index; i < n; i++) {
         this._applicationsButtons[i].actor.show();
      }
   },

   _preserveClear: function() {
      let box = this.applicationsScrollBox.actor.get_allocation_box();
      if(this._applicationsButtons.length > 0)
         this.MaxH = this._applicationsButtons[0].actor.get_height();
      let maxApp = Math.floor(this.iconViewCount*(box.y2 - box.y1)/this.MaxH);
      this.initButtonLoad = Math.min(this._applicationsButtons.length, maxApp + 1);
      this.standarHeight = this.standarAppBox.get_height();
      for(let i = 0; i < this.initButtonLoad; i++) {
         this._applicationsButtons[i].actor.show();
      }
      for(let i = this.initButtonLoad; i < this._applicationsButtons.length; i++) {
         this._applicationsButtons[i].actor.hide();
      }
   },

   _clearCategories: function() {
      for(let i = 0; i < this._categoryButtons.length; i++) {
         this._categoryButtons[i].actor.hide();
      }
      for(let i = 0; i < this._favoritesButtons.length; i++) {
         this._favoritesButtons[i].actor.hide();
      }
   },

   _onOpenStateChanged: function(menu, open) {
      if(open) {
         if(this.displayed) {
            Mainloop.idle_add(Lang.bind(this, this._initial_cat_selection, this.initButtonLoad));
         }
         this.menuIsOpening = true;
         this._initialDisplay();
         global.stage.set_key_focus(this.searchEntry);
         this.actor.add_style_pseudo_class('active');
         this._selectedItemIndex = null;
         this._activeContainer = null;
         this._activeActor = null;
         this._allAppsCategoryButton.actor.set_style_class_name('menu-category-button-selected');
         this._allAppsCategoryButton.actor.add_style_class_name('menu-category-button-selected-' + this.theme);
         this._previousTreeSelectedActor = this._allAppsCategoryButton.actor;
         this._allAppsCategoryButton.setArrowVisible(true);
         this.repositionGnomeCategory();
         this.standarAppBox.set_height(this.standarHeight);
         this.menuManager._onMenuOpenState(menu, open);

         Mainloop.idle_add(Lang.bind(this, function() {
            this.selectedAppBox.setDateTimeVisible(this.showTimeDate);
            global.stage.set_key_focus(this.searchEntry);
            this.standarAppBox.set_height(-1);
         }));
      }
      else {
         this.actor.remove_style_pseudo_class('active');
         this._disconnectSearch();
         this._select_category(null, this._allAppsCategoryButton);
         this.appMenuClose();
         if(this.bttChanger) 
            this.bttChanger.activateSelected(_("All Applications"));
         Mainloop.idle_add(Lang.bind(this, function() {
            if(this.searchActive) {
               this.searchEntry.set_text("");
               this._previousSearchPattern = "";
               this.searchActive = false;
               this._setCategoriesButtonActive(true);
            }
            this._disableResize();
            this.selectedAppBox.setSelectedText("", "");
            this.hover.refreshFace();
            this.hover.closeMenu();
            this._clearAllSelections(false);
            this._preserveClear();
            this._previousTreeItemIndex = null;
            this._previousTreeSelectedActor = null;
            this._previousSelectedActor = null;
            this.closeApplicationsContextMenus(false);
            // this._refreshFavs();
            // if(this.accessibleBox)
            //    this.accessibleBox.refreshAccessibleItems();
            if(this.gnoMenuBox)
               this.gnoMenuBox.setSelected(_("Favorites"));
            this.powerBox.disableSelected();
            this.selectedAppBox.setDateTimeVisible(false);
            this.repositionActor = null;
            this._activeGnomeMenu();
            this.categoriesScrollBox.scrollToActor(this._allAppsCategoryButton.actor);
            this.destroyVectorBox();
            this.menuManager._onMenuOpenState(menu, open);
            this._restartAutoscroll();
         }));
      }
      return true;
   }
};

function main(metadata, orientation, panel_height, instance_id) {  
    let myApplet = new MyApplet(metadata, orientation, panel_height, instance_id);
    return myApplet;      
}  
